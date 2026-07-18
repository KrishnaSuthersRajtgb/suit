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
  rejectVisitor,
} = require("../controllers/visitorController");

const router = express.Router();

router.get("/", listVisitors); // Security tab — list of visitors, ?plant=CODE to filter
router.post("/register", registerVisitor); // Manager tab — approve/register a visitor
router.post("/checkin", checkinVisitor); // Visitor tab — app login by phone
router.get("/:id", getVisitorById); // rehydrate VisitorDashboard on refresh
router.post("/:id/checkin", securityCheckIn); // Security — physical check-in
router.post("/:id/checkout", securityCheckOut); // Security — physical check-out
router.post("/:id/reject", rejectVisitor); // Security — reject
router.post("/:id/assessment", submitAssessment); // SafetyAssessment result
router.post("/:id/pass", issuePass); // VisitorPass page

module.exports = router;