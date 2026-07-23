const express = require("express");
const { getActiveVideo, getAllVideos, createVideo } = require("../controllers/videoController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/active", getActiveVideo);
router.get("/all", protect, requireRole("ADMIN"), getAllVideos);
router.post("/", protect, requireRole("ADMIN"), createVideo);

module.exports = router;