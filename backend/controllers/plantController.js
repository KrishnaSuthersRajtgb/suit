const Plant = require("../models/Plant");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/plants — used to populate the Plant dropdown on the login page.
const getPlants = asyncHandler(async (req, res) => {
  const plants = await Plant.find({ status: "ACTIVE" }).sort({ plantName: 1 });
  res.json(plants);
});

module.exports = { getPlants };
