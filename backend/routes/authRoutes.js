const express = require("express");
const { loginAdmin, loginManager } = require("../controllers/authController");

const router = express.Router();

router.post("/admin/login", loginAdmin);
router.post("/manager/login", loginManager);

module.exports = router;
