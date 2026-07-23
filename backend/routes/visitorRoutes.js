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

const router = express.Router();

router.get("/", listVisitors); // Security tab — ?plant=CODE&status=X&includePipeline=true
router.post("/register", registerVisitor); // Manager tab — invite a visitor
router.post("/checkin", checkinVisitor); // Visitor tab — app login by phone
router.get("/:id", getVisitorById); // rehydrate VisitorDashboard on refresh
router.post("/:id/assessment", submitAssessment); // SafetyAssessment: { stage: "video" } or { stage: "quiz", score, total }
router.post("/:id/pass", issuePass); // VisitorPass page
router.post("/:id/checkin", securityCheckIn); // Security — physical check-in
router.post("/:id/checkout", securityCheckOut); // Security — physical check-out
router.post("/:id/close", closeVisitor); // Security/Admin — close a finished visit
router.post("/:id/reject", rejectVisitor); // Security — reject at the gate
router.post("/:id/cancel", cancelVisitor); // Manager/Admin — cancel before arrival

module.exports = router;