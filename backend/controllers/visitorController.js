const mongoose = require("mongoose");
const Visitor = require("../models/Visitor");
const Plant = require("../models/Plant");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../middleware/asyncHandler");

const normalizePhone = (phone) => phone.replace(/\s+/g, "").trim();

// Must match SafetyAssessment.jsx's PASS_MARK — keep these in sync.
const PASS_MARK = 0.8;

// A Manager's approval, and the Visitor Pass it leads to, are only valid for
// the calendar day they were created — everything below scopes to "today"
// (server local time) so nothing from a previous day carries over.
const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return { start, end };
};

const isFromToday = (date) => {
  const { start, end } = getTodayRange();
  const d = new Date(date);
  return d >= start && d < end;
};

const findVisitorOr404 = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, "Visitor not found.");
  }
  const visitor = await Visitor.findById(id).populate("plant", "plantCode plantName location");
  if (!visitor) {
    throw new ApiError(404, "Visitor not found.");
  }
  return visitor;
};

// POST /api/visitors/register — used by the Manager tab to approve/register
// an incoming visitor. The record starts at status "APPROVED"; Security then
// handles CHECKED_IN / CHECKED_OUT / REJECTED at the gate.
const registerVisitor = asyncHandler(async (req, res) => {
  const { name, phone, company, purpose, host, plant } = req.body;

  if (!name || !phone || !purpose || !host || !plant) {
    throw new ApiError(400, "Name, phone, purpose, host and plant are required.");
  }

  const plantDoc = await Plant.findOne({ plantCode: plant.toUpperCase() });
  if (!plantDoc) {
    throw new ApiError(400, "Selected plant was not found.");
  }

  const visitor = await Visitor.create({
    name: name.trim(),
    phone: normalizePhone(phone),
    company: (company || "").trim(),
    purpose,
    host: host.trim(),
    plant: plantDoc._id,
    status: "APPROVED",
  });

  res.status(201).json({
    message: `Approved "${visitor.name}" for ${plantDoc.plantName}. Security can now check them in at the gate.`,
    visitor,
  });
});

// GET /api/visitors?plant=CODE&status=APPROVED — used by the Security tab's
// list view. Only shows visitors approved TODAY — a Manager's approval (and
// the pass it leads to) expires at midnight, so yesterday's visitors never
// show up here even if they were never checked in/out.
const listVisitors = asyncHandler(async (req, res) => {
  const { plant, status } = req.query;
  const { start, end } = getTodayRange();
  const filter = { registeredAt: { $gte: start, $lt: end } };

  if (plant) {
    const plantDoc = await Plant.findOne({ plantCode: String(plant).toUpperCase() });
    if (!plantDoc) {
      throw new ApiError(400, "Selected plant was not found.");
    }
    filter.plant = plantDoc._id;
  }

  // Counts reflect the day + plant scope regardless of the status filter,
  // so the summary badges stay accurate no matter which status is selected.
  const countRows = await Visitor.aggregate([
    { $match: filter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts = { APPROVED: 0, CHECKED_IN: 0, CHECKED_OUT: 0, REJECTED: 0 };
  for (const row of countRows) counts[row._id] = row.count;

  if (status) {
    if (!["APPROVED", "CHECKED_IN", "CHECKED_OUT", "REJECTED"].includes(status)) {
      throw new ApiError(400, "Invalid status filter.");
    }
    filter.status = status;
  }

  const visitors = await Visitor.find(filter)
    .sort({ registeredAt: -1 })
    .limit(200)
    .populate("plant", "plantCode plantName location");

  res.json({ visitors, counts });
});

// POST /api/visitors/:id/checkin — Security marks an approved visitor as
// physically checked in at the gate.
const securityCheckIn = asyncHandler(async (req, res) => {
  const visitor = await findVisitorOr404(req.params.id);

  if (visitor.status !== "APPROVED") {
    throw new ApiError(400, "Only approved visitors awaiting arrival can be checked in.");
  }

  visitor.status = "CHECKED_IN";
  visitor.checkedInAt = new Date();
  await visitor.save();

  res.json({ visitor });
});

// POST /api/visitors/:id/checkout — Security marks a checked-in visitor as
// having left the site.
const securityCheckOut = asyncHandler(async (req, res) => {
  const visitor = await findVisitorOr404(req.params.id);

  if (visitor.status !== "CHECKED_IN") {
    throw new ApiError(400, "Only checked-in visitors can be checked out.");
  }

  visitor.status = "CHECKED_OUT";
  visitor.checkedOutAt = new Date();
  await visitor.save();

  res.json({ visitor });
});

// POST /api/visitors/:id/reject — Security declines an approved visitor
// before they're checked in (e.g. ID doesn't match, no longer expected).
const rejectVisitor = asyncHandler(async (req, res) => {
  const visitor = await findVisitorOr404(req.params.id);

  if (visitor.status !== "APPROVED") {
    throw new ApiError(400, "Only approved visitors awaiting arrival can be rejected.");
  }

  visitor.status = "REJECTED";
  visitor.rejectedAt = new Date();
  await visitor.save();

  res.json({ visitor });
});

// POST /api/visitors/checkin — used by the Visitor tab (phone number only).
// This is the visitor's own app-session login, separate from Security's
// physical gate check-in/out above — it doesn't change `status`.
// Only matches a visitor APPROVED TODAY — yesterday's approval has expired,
// so the visitor needs a fresh Manager approval to get in today.
const checkinVisitor = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required.");
  }

  const { start, end } = getTodayRange();

  const visitor = await Visitor.findOne({
    phone: normalizePhone(phone),
    registeredAt: { $gte: start, $lt: end },
  })
    .sort({ registeredAt: -1 }) // most recent approval for that number, today
    .populate("plant", "plantCode plantName location");

  if (!visitor) {
    throw new ApiError(404, "No approved visitor record found for today. Please contact your host or the site office for a new approval.");
  }

  if (visitor.status === "REJECTED") {
    throw new ApiError(403, "This visit request was rejected. Please contact the site office.");
  }

  res.json({ visitor });
});

// GET /api/visitors/:id — used to rehydrate VisitorDashboard on page refresh.
// If the visitor's approval wasn't from today, treat the session as expired
// so the app clears it and sends them back to login for a fresh approval.
const getVisitorById = asyncHandler(async (req, res) => {
  const visitor = await findVisitorOr404(req.params.id);

  if (!isFromToday(visitor.registeredAt)) {
    throw new ApiError(410, "Your approved visit has expired. Please get a new approval for today.");
  }

  res.json({ visitor });
});

// POST /api/visitors/:id/assessment — called by SafetyAssessment when the quiz finishes.
const submitAssessment = asyncHandler(async (req, res) => {
  const { score, total } = req.body;

  if (typeof score !== "number" || typeof total !== "number" || total <= 0) {
    throw new ApiError(400, "score and total are required numbers.");
  }

  const visitor = await findVisitorOr404(req.params.id);

  const passed = score / total >= PASS_MARK;

  visitor.induction.assessmentScore = score;
  visitor.induction.assessmentTotal = total;
  visitor.induction.attemptedAt = new Date();
  visitor.induction.status = passed ? "PASSED" : "FAILED";
  if (passed) visitor.induction.completedAt = new Date();

  await visitor.save();

  res.json({ visitor, passed });
});

// POST /api/visitors/:id/pass — issues (or returns the existing) Visitor Pass.
// Only visitors whose induction has PASSED can be issued a pass.
const issuePass = asyncHandler(async (req, res) => {
  const visitor = await findVisitorOr404(req.params.id);

  if (visitor.induction.status !== "PASSED") {
    throw new ApiError(403, "Complete and pass the safety assessment before a pass can be issued.");
  }

  // Idempotent — a visitor gets exactly one pass per visit.
  if (!visitor.pass?.passId) {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setHours(23, 59, 59, 999);

    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const randPart = Math.random().toString(36).slice(2, 7).toUpperCase();

    visitor.pass = {
      passId: `EHS-${datePart}-${randPart}`,
      issuedAt: now,
      validUntil,
    };
    await visitor.save();
  }

  res.json({ visitor });
});

module.exports = {
  registerVisitor,
  checkinVisitor,
  getVisitorById,
  submitAssessment,
  issuePass,
  listVisitors,
  securityCheckIn,
  securityCheckOut,
  rejectVisitor,
};