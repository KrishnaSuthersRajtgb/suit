const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Videos are uploaded straight to Cloudinary (folder: "ehs-suite/videos")
// instead of local disk — this makes uploads work identically on localhost
// and on the deployed backend, and survives server restarts/redeploys.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ehs-suite/videos",
    resource_type: "video",
    // Keep the original filename (minus extension) + a timestamp so files
    // don't collide, similar to the old local-disk naming scheme.
    public_id: (req, file) => {
      const base = file.originalname.replace(/\.[^/.]+$/, "");
      return `${Date.now()}-${base}`;
    },
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