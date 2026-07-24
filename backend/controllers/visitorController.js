const crypto = require("crypto");
const Visitor = require("../models/Visitor");

// ─────────────────────────────────────────────────────────────────────────────
// State machine — the only paths a visitor is allowed to move through.
// Keeping this server-side (not just in the UI) means a stale/replayed
// request can never push a visitor into an invalid state.
// ─────────────────────────────────────────────────────────────────────────────
const TRANSITIONS = {
  DRAFT:              ["INVITED", "CANCELLED"],
  INVITED:            ["INDUCTION_STARTED", "EXPIRED", "CANCELLED", "REJECTED"],
  INDUCTION_STARTED:  ["VIDEO_COMPLETED", "EXPIRED", "CANCELLED"],
  VIDEO_COMPLETED:    ["ASSESSMENT_PASSED", "FAILED_ASSESSMENT", "EXPIRED", "CANCELLED"],
  FAILED_ASSESSMENT:  ["VIDEO_COMPLETED", "CANCELLED"], // retry the quiz
  ASSESSMENT_PASSED:  ["PASS_GENERATED", "EXPIRED", "CANCELLED"],
  PASS_GENERATED:     ["CHECKED_IN", "REJECTED", "EXPIRED", "CANCELLED"],
  CHECKED_IN:         ["CHECKED_OUT"],
  CHECKED_OUT:        ["CLOSED"],
  CLOSED:             [],
  EXPIRED:            [],
  REJECTED:           [],
  CANCELLED:          [],
};

// Statuses Security should see WITHOUT asking for the full pipeline —
// i.e. a Manager's invite alone never lands in Security's default queue.
const GATE_RELEVANT_STATUSES = [
  "PASS_GENERATED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CLOSED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
];

// Everything else — shown only when the Security dashboard explicitly asks
// for pipeline visibility (?includePipeline=true), and read-only there.
const PRE_GATE_STATUSES = [
  "DRAFT",
  "INVITED",
  "INDUCTION_STARTED",
  "VIDEO_COMPLETED",
  "FAILED_ASSESSMENT",
  "ASSESSMENT_PASSED",
];

const ASSESSMENT_PASS_THRESHOLD = 0.8; // 80% to pass

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

async function transition(visitor, to, { timestampField, note, extra = {} } = {}) {
  if (!canTransition(visitor.status, to)) {
    const err = new Error(`Cannot move visitor from ${visitor.status} to ${to}.`);
    err.status = 409;
    throw err;
  }
  visitor.status = to;
  if (timestampField) visitor[timestampField] = new Date();
  visitor.statusHistory.push({ status: to, at: new Date(), note });

  // Use Mongoose's .set() so dot-notation paths like "pass.passId" correctly
  // write into nested subdocuments — Object.assign treats them as flat
  // string keys and silently drops them.
  for (const [path, value] of Object.entries(extra)) {
    visitor.set(path, value);
  }

  await visitor.save();
  return visitor;
}

// Hardcoded IST offset — deterministic regardless of the server's local
// timezone. Previously this used Date.setHours(), which silently produces
// wrong "days" if the host process runs in UTC (common on most hosting
// platforms) instead of IST.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Given any UTC instant, returns the UTC instant of IST midnight for that
// same IST calendar day. Pure arithmetic — never touches the server's
// local TZ setting.
function startOfISTDay(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}

function startOfToday() {
  return startOfISTDay(new Date());
}

// Given a "YYYY-MM-DD" string from the date picker (interpreted as an IST
// calendar date, since this app is India-only), returns the UTC instant of
// IST midnight for that date — e.g. "2026-07-29" → 2026-07-28T18:30:00.000Z.
function istMidnightFromDateString(str) {
  const [y, m, d] = str.split("-").map(Number);
  const utcMidnightOfDate = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return new Date(utcMidnightOfDate - IST_OFFSET_MS);
}

// Statuses that represent an unfinished visit which can go stale — mirrors
// TRANSITIONS: every one of these already allows a direct move to EXPIRED.
const EXPIRABLE_STATUSES = ["INVITED", "INDUCTION_STARTED", "VIDEO_COMPLETED", "ASSESSMENT_PASSED", "PASS_GENERATED"];

// Lazily flips any visitor still sitting in an unfinished state whose
// scheduled visitDate has already passed to EXPIRED. Called on read
// (listVisitors) rather than via a cron job, so it only touches records
// someone is actually looking at.
async function expireStaleVisitors(visitors) {
  const today = startOfToday();
  for (const v of visitors) {
    if (!EXPIRABLE_STATUSES.includes(v.status)) continue;
    const scheduled = v.visitDate ? startOfISTDay(v.visitDate) : startOfISTDay(v.registeredAt);
    if (scheduled >= today) continue; // today or in the future — not stale
    try {
      await transition(v, "EXPIRED", { timestampField: "expiredAt" });
    } catch {
      // Shouldn't happen — EXPIRABLE_STATUSES are all valid EXPIRED sources —
      // but never let one bad record break the whole list response.
    }
  }
}

// ── Manager tab — invite/approve a visitor ──────────────────────────────────
exports.registerVisitor = async (req, res) => {
  try {
    const { name, phone, company, purpose, host, plant, visitDate } = req.body;

    if (!name || !phone || !purpose || !host || !plant) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // `plant` may arrive as either a Mongo _id (from a fixed dropdown) or a
    // human-readable plantCode (from QR/manual entry) — resolve either way
    // so a bad string never reaches Mongoose's ObjectId cast.
    const Plant = require("../models/Plant");
    const plantDoc = /^[0-9a-fA-F]{24}$/.test(plant)
      ? await Plant.findById(plant)
      : await Plant.findOne({ plantCode: plant });

    if (!plantDoc) {
      return res.status(400).json({ message: `Unknown plant: "${plant}". Please select a valid plant.` });
    }

    // Manager can schedule a visit for today or a future date. Defaults to
    // today when omitted, so any existing frontend that doesn't send this
    // field keeps working exactly as before.
    let scheduledDate = startOfToday();
if (visitDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
    return res.status(400).json({ message: "Invalid visit date." });
  }
  scheduledDate = istMidnightFromDateString(visitDate);
}

    const visitor = await Visitor.create({
      name,
      phone: phone.replace(/\D/g, ""),
      company,
      purpose,
      host,
      plant: plantDoc._id,
      visitDate: scheduledDate,
      registeredBy: req.user?._id,
      status: "INVITED",
      invitedAt: new Date(),
      statusHistory: [{ status: "INVITED", at: new Date() }],
    });

    res.status(201).json({
  message: `${name} has been invited for ${scheduledDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}. They'll appear at the gate once induction and their pass are complete.`,
  visitor,
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Visitor tab — app login by phone ────────────────────────────────────────
exports.checkinVisitor = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required." });

    const normalized = phone.replace(/\D/g, "");

    // Most recent non-terminal visit for this number.
    const visitor = await Visitor.findOne({
      phone: normalized,
      status: { $in: ["INVITED", "INDUCTION_STARTED", "VIDEO_COMPLETED", "FAILED_ASSESSMENT", "ASSESSMENT_PASSED", "PASS_GENERATED", "CHECKED_IN"] },
    }).sort({ invitedAt: -1 });

    if (!visitor) {
      // Check if the most recent record for this number was rejected/expired,
      // to give a more useful error than a bare 404.
      const last = await Visitor.findOne({ phone: normalized }).sort({ registeredAt: -1 });
      if (last?.status === "REJECTED") {
        return res.status(403).json({ message: "Your visit request was rejected." });
      }
      if (last?.status === "EXPIRED") {
        return res.status(410).json({ message: "Your invitation has expired. Please ask your host to re-invite you." });
      }
      return res.status(404).json({ message: "No approved visit found for this number." });
    }

    // First login kicks off induction; re-logins are idempotent rehydration.
    if (visitor.status === "INVITED") {
      await transition(visitor, "INDUCTION_STARTED", { timestampField: "inductionStartedAt" });
    }

    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Rehydrate VisitorDashboard on refresh ───────────────────────────────────
exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    res.json({ visitor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SafetyAssessment page — video-complete and quiz-submit, two stages ─────
// Body: { stage: "video" }                     → marks the safety video watched
// Body: { stage: "quiz", score, total }         → grades the quiz
exports.submitAssessment = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });

    const { stage, score, total } = req.body;

    if (stage === "video") {
      await transition(visitor, "VIDEO_COMPLETED", { timestampField: "videoCompletedAt" });
      return res.json({ visitor });
    }

    if (stage === "quiz") {
      if (typeof score !== "number" || typeof total !== "number" || total <= 0) {
        return res.status(400).json({ message: "score and total are required." });
      }
      const passed = score / total >= ASSESSMENT_PASS_THRESHOLD;

      await transition(visitor, passed ? "ASSESSMENT_PASSED" : "FAILED_ASSESSMENT", {
        timestampField: passed ? "assessmentPassedAt" : "failedAssessmentAt",
        extra: {
          "induction.assessmentScore": score,
          "induction.assessmentTotal": total,
          "induction.attemptedAt": new Date(),
          "induction.attempts": (visitor.induction?.attempts || 0) + 1,
        },
      });

      return res.json({ visitor, passed });
    }

    return res.status(400).json({ message: "stage must be 'video' or 'quiz'." });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── VisitorPass page — issue the pass once assessment is passed ────────────
// Idempotent: if a pass already exists (status is PASS_GENERATED or the
// visitor has already moved further through the gate flow — CHECKED_IN,
// CHECKED_OUT, CLOSED), just return the existing pass instead of trying to
// transition again. A visitor re-logging in with the same phone number
// (see checkinVisitor) will hit this route again through the normal page
// flow, and that must not be treated as an error.
const PASS_ALREADY_ISSUED_STATUSES = ["PASS_GENERATED", "CHECKED_IN", "CHECKED_OUT", "CLOSED"];

exports.issuePass = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });

    if (PASS_ALREADY_ISSUED_STATUSES.includes(visitor.status)) {
      // Already has a pass — just hand it back.
      return res.json({ visitor });
    }

    const passId = `EHS-${visitor.plant.toString().slice(-4).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const validUntil = new Date();
    validUntil.setHours(23, 59, 59, 999); // valid through end of day

    await transition(visitor, "PASS_GENERATED", {
      timestampField: "passGeneratedAt",
      extra: {
        "pass.passId": passId,
        "pass.issuedAt": new Date(),
        "pass.validUntil": validUntil,
      },
    });

    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Security tab — list visitors ────────────────────────────────────────────
// Default: only gate-relevant statuses (pass generated onward), scoped to
// visitors whose visitDate is TODAY specifically — a visitor invited today
// for tomorrow should not show up at the gate until tomorrow, and one
// invited last week for today should still show up.
// Pass ?includePipeline=true to additionally see pre-gate visitors
// (Invited / Induction Started / etc.) — read-only, informational only.
// Pass ?includeAll=true (Admin dashboard) to see every status across every
// date — Admin needs full history, not just today's records.
exports.listVisitors = async (req, res) => {
  try {
    const { plant, status, includePipeline, includeAll } = req.query;

    const query = {};
    if (plant) query.plant = plant;

    if (status) {
      query.status = status;
    } else if (includeAll === "true" || includePipeline === "true") {
      // includeAll (Admin) and includePipeline (Security's pipeline view)
      // both want every status visible — gate-relevant and pre-gate.
      query.status = { $in: [...GATE_RELEVANT_STATUSES, ...PRE_GATE_STATUSES] };
    } else {
      query.status = { $in: GATE_RELEVANT_STATUSES };
    }

    // Scope Security's default (non-includeAll) view to visitors scheduled
    // for exactly today (visitDate), regardless of status — this replaces
    // the previous registeredAt-based scoping now that a visit can be
    // invited today for a future date. Admin (includeAll=true) is exempt:
    // it needs full history, not just today's records.
    if (includeAll !== "true") {
      const today = startOfToday();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.visitDate = { $gte: today, $lt: tomorrow };
    }

    const visitors = await Visitor.find(query)
      .populate("plant", "plantName plantCode location")
      .sort({ registeredAt: -1 });

    // Only worth sweeping when the caller can actually see stale records —
    // Security's default (today-only) query never returns anything old
    // enough to expire, so skip the extra writes there.
    if (includeAll === "true" || includePipeline === "true") {
      await expireStaleVisitors(visitors);
    }

    const counts = {};
    for (const s of Visitor.STATUSES) counts[s] = 0;
    for (const v of visitors) counts[v.status] = (counts[v.status] || 0) + 1;

    res.json({ visitors, counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Security — physical check-in at the gate ────────────────────────────────
exports.securityCheckIn = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    await transition(visitor, "CHECKED_IN", { timestampField: "checkedInAt" });
    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Security — physical check-out at the gate ───────────────────────────────
exports.securityCheckOut = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    await transition(visitor, "CHECKED_OUT", { timestampField: "checkedOutAt" });
    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Security/Admin — close out a finished visit ──────────────────────────────
exports.closeVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    await transition(visitor, "CLOSED", { timestampField: "closedAt" });
    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Security — reject at the gate (or Manager, before the gate) ────────────
exports.rejectVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    await transition(visitor, "REJECTED", {
      timestampField: "rejectedAt",
      extra: req.body?.reason ? { rejectionReason: req.body.reason } : {},
    });
    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Cancel — visitor or host backs out before arrival ───────────────────────
exports.cancelVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found." });
    await transition(visitor, "CANCELLED", { timestampField: "cancelledAt" });
    res.json({ visitor });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.GATE_RELEVANT_STATUSES = GATE_RELEVANT_STATUSES;
exports.PRE_GATE_STATUSES = PRE_GATE_STATUSES;