const express = require("express");
const { createStaff, listStaff } = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/staff", protect, requireRole("ADMIN"), listStaff);
router.post("/staff", protect, requireRole("ADMIN"), createStaff);

module.exports = router;