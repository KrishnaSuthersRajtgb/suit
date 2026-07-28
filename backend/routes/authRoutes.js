const express = require("express");
const { loginAdmin, loginManager, loginSecurity, login } = require("../controllers/authController");   // add login

const router = express.Router();

router.post("/admin/login", loginAdmin);
router.post("/manager/login", loginManager);
router.post("/security/login", loginSecurity);
router.post("/login", login);   // add this line — single unified staff login

module.exports = router;