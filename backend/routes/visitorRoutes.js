// After
const express = require("express");
const {
  registerVisitor,
  checkinVisitor,
  getVisitorById,
  submitAssessment,
  issuePass,
  listVisitors,
  securityCheckIn,
  securityCheckOut,
  closeVisitor,
  rejectVisitor,
  cancelVisitor,
} = require("../controllers/visitorController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ── Staff-only (Admin/Manager/Security) — require a valid JWT ──────────────
// Previously none of these had `protect`, so req.user was always undefined
// here — that's why registerVisitor's registeredBy silently never saved,
// and why these endpoints were reachable without any staff login at all.
router.get("/", protect, listVisitors); // Security tab — ?plant=CODE&status=X&includePipeline=true
router.post("/register", protect, registerVisitor); // Manager/Admin tab — invite a visitor
router.post("/:id/checkin", protect, securityCheckIn); // Security — physical check-in
router.post("/:id/checkout", protect, securityCheckOut); // Security — physical check-out
router.post("/:id/close", protect, closeVisitor); // Security/Admin — close a finished visit
router.post("/:id/reject", protect, rejectVisitor); // Security — reject at the gate
router.post("/:id/cancel", protect, cancelVisitor); // Manager/Admin — cancel before arrival

// ── Visitor-facing — deliberately public, no staff token involved ──────────
// The visitor app flow (phone check-in → induction → pass) never carries an
// "ehs_token"; these must stay open.
router.post("/checkin", checkinVisitor); // Visitor tab — app login by phone
router.get("/:id", getVisitorById); // rehydrate VisitorDashboard on refresh
router.post("/:id/assessment", submitAssessment); // SafetyAssessment: { stage: "video" } or { stage: "quiz", score, total }
router.post("/:id/pass", issuePass); // VisitorPass page

module.exports = router;