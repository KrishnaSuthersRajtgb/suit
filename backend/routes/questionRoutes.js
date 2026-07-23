const express = require("express");
const {
  getActiveQuestions,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public — the visitor assessment page carries no auth token.
router.get("/", getActiveQuestions);

// Admin-only management.
router.get("/all", protect, requireRole("ADMIN"), getAllQuestions);
router.post("/", protect, requireRole("ADMIN"), createQuestion);
router.put("/:id", protect, requireRole("ADMIN"), updateQuestion);
router.delete("/:id", protect, requireRole("ADMIN"), deleteQuestion);

module.exports = router;