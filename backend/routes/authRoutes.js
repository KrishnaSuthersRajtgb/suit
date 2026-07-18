const express = require("express");
const { loginAdmin, loginManager, loginSecurity } = require("../controllers/authController");   // add loginSecurity

const router = express.Router();

router.post("/admin/login", loginAdmin);
router.post("/manager/login", loginManager);
router.post("/security/login", loginSecurity);   // add this line

module.exports = router;