const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Videos are stored locally under backend/uploads/videos and served
// statically (see server.js) at /uploads/videos/<filename>.
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "videos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_MIME = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4, WebM, OGG, or MOV video files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

module.exports = upload;