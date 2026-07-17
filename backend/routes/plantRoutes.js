const express = require("express");
const { getPlants } = require("../controllers/plantController");

const router = express.Router();

router.get("/", getPlants);

module.exports = router;
