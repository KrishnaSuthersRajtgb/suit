const mongoose = require("mongoose");
const Visitor = require("../models/Visitor");
const Plant = require("../models/Plant");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../middleware/asyncHandler");

const normalizePhone = (phone) => phone.replace(/\s+/g, "").trim();

// Must match SafetyAssessment.jsx's PASS_MARK — keep these in sync.
const PASS_MARK = 0.8;

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

// POST /api/visitors/register — used by the Security tab.
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
    status: "REGISTERED",
  });

  res.status(201).json({
    message: `Registered "${visitor.name}" for ${plantDoc.plantName}.`,
    visitor,
  });
});

// POST /api/visitors/checkin — used by the Visitor tab (phone number only).
const checkinVisitor = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required.");
  }

  const visitor = await Visitor.findOne({ phone: normalizePhone(phone) })
    .sort({ registeredAt: -1 }) // most recent registration for that number
    .populate("plant", "plantCode plantName location");

  if (!visitor) {
    throw new ApiError(404, "No record found for this number. Please check in at Security first.");
  }

  if (visitor.status === "REGISTERED") {
    visitor.status = "CHECKED_IN";
    visitor.checkedInAt = new Date();
    await visitor.save();
  }

  res.json({ visitor });
});

// GET /api/visitors/:id — used to rehydrate VisitorDashboard on page refresh.
const getVisitorById = asyncHandler(async (req, res) => {
  const visitor = await findVisitorOr404(req.params.id);
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

module.exports = { registerVisitor, checkinVisitor, getVisitorById, submitAssessment, issuePass };