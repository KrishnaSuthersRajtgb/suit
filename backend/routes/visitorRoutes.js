const express = require("express");
const {
  registerVisitor,
  checkinVisitor,
  getVisitorById,
  submitAssessment,
  issuePass,
} = require("../controllers/visitorController");

const router = express.Router();

router.post("/register", registerVisitor);        // Security tab
router.post("/checkin", checkinVisitor);           // Visitor tab

router.get("/:id", getVisitorById);                 // rehydrate VisitorDashboard on refresh
router.post("/:id/assessment", submitAssessment);   // SafetyAssessment quiz result
router.post("/:id/pass", issuePass);                // issue (or re-fetch) the Visitor Pass

module.exports = router;