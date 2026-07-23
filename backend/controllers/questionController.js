const Question = require("../models/Question");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

// GET /api/questions — PUBLIC. Used by the visitor-facing SafetyAssessment
// page (visitor check-in never carries a JWT). Returns only ACTIVE
// questions, scoped to the visitor's plant plus any global (plant: null) ones.
const getActiveQuestions = asyncHandler(async (req, res) => {
  const { plant } = req.query;
  const filter = { status: "ACTIVE" };
  filter.$or = plant ? [{ plant: null }, { plant }] : [{ plant: null }];

  const questions = await Question.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(questions);
});

// GET /api/questions/all — admin management view, every status.
const getAllQuestions = asyncHandler(async (req, res) => {
  const { plant } = req.query;
  const filter = {};
  if (plant) filter.plant = plant;

  const questions = await Question.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(questions);
});

const createQuestion = asyncHandler(async (req, res) => {
  const { question, options, correct, plant, order } = req.body;

  if (!question || !Array.isArray(options) || options.length < 2) {
    throw new ApiError(400, "Question text and at least 2 options are required.");
  }
  if (correct === undefined || correct === null || correct < 0 || correct >= options.length) {
    throw new ApiError(400, "`correct` must be a valid index into `options`.");
  }

  const doc = await Question.create({
    question: question.trim(),
    options: options.map((o) => String(o).trim()),
    correct,
    plant: plant || null,
    order: order ?? 0,
    createdBy: req.user.id,
  });

  res.status(201).json(doc);
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { question, options, correct, plant, order, status } = req.body;

  const doc = await Question.findById(id);
  if (!doc) throw new ApiError(404, "Question not found.");

  if (question !== undefined) doc.question = question.trim();
  if (options !== undefined) {
    if (!Array.isArray(options) || options.length < 2) {
      throw new ApiError(400, "At least 2 options are required.");
    }
    doc.options = options.map((o) => String(o).trim());
  }
  if (correct !== undefined) doc.correct = correct;
  if (plant !== undefined) doc.plant = plant || null;
  if (order !== undefined) doc.order = order;
  if (status !== undefined) doc.status = status;
  doc.updatedBy = req.user.id;

  await doc.save(); // re-runs the pre("validate") correct-index check
  res.json(doc);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await Question.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "Question not found.");
  res.json({ message: "Question deleted." });
});

module.exports = {
  getActiveQuestions,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};