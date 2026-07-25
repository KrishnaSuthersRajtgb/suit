const express = require("express");
const { getActiveVideo, getAllVideos, createVideo } = require("../controllers/videoController");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/active", getActiveVideo);
router.get("/all", protect, requireRole("ADMIN"), getAllVideos);
// upload.single("video") is a no-op when the request is plain JSON (no file
// field present) — it only kicks in for multipart/form-data requests that
// include a "video" file field, so URL-based submissions still work exactly
// as before.
router.post("/", protect, requireRole("ADMIN"), upload.single("video"), createVideo);

module.exports = router;