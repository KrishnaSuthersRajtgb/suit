const InductionVideo = require("../models/InductionVideo");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

// GET /api/video/active — PUBLIC. Used by SafetyAssessment.
const getActiveVideo = asyncHandler(async (req, res) => {
  const { plant } = req.query;
  const filter = { isActive: true };
  filter.$or = plant ? [{ plant: null }, { plant }] : [{ plant: null }];

  // A plant-specific active video (if any) takes priority over the global one.
  const video = await InductionVideo.findOne(filter).sort({ plant: -1, createdAt: -1 });
  res.json(video || null);
});

// GET /api/video/all — admin history view.
const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await InductionVideo.find().sort({ createdAt: -1 });
  res.json(videos);
});

// POST /api/video — admin sets a new active video. Deactivates any previous
// active video in the same scope (same plant, or global if plant omitted)
// so there's only ever one active video per scope.
const createVideo = asyncHandler(async (req, res) => {
  const { title, url, plant } = req.body;

  if (!url || !url.trim()) {
    throw new ApiError(400, "Video URL is required.");
  }

  const scope = plant || null;
  await InductionVideo.updateMany({ plant: scope, isActive: true }, { isActive: false });

  const doc = await InductionVideo.create({
    title: title?.trim() || "Site Safety Induction",
    url: url.trim(),
    plant: scope,
    isActive: true,
    createdBy: req.user.id,
  });

  res.status(201).json(doc);
});

module.exports = { getActiveVideo, getAllVideos, createVideo };