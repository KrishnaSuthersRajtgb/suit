const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Plant = require("../models/Plant");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../middleware/asyncHandler");

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      plant: user.plant,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

// Shared by the Admin and Manager forms — each only accepts users whose
// stored role matches the tab they logged in from.
const loginWithRole = (allowedRole) =>
  asyncHandler(async (req, res, next) => {
    const { username, password, plant } = req.body;

    if (!username || !password || !plant) {
      throw new ApiError(400, "Username, password and plant are required.");
    }

    const plantDoc = await Plant.findOne({ plantCode: plant.toUpperCase() });
    if (!plantDoc) {
      throw new ApiError(400, "Selected plant was not found.");
    }

    const user = await User.findOne({
      username: username.trim().toLowerCase(),
      role: allowedRole,
    });

    if (!user) {
      throw new ApiError(401, "Invalid username or password.");
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(403, "This account is not active. Contact your administrator.");
    }

    if (String(user.plant) !== String(plantDoc._id)) {
      throw new ApiError(403, "This account is not registered for the selected plant.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid username or password.");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        plant: plantDoc.plantCode,
        plantName: plantDoc.plantName,
      },
    });
  });

const loginAdmin = loginWithRole("ADMIN");
const loginManager = loginWithRole("MANAGER");

module.exports = { loginAdmin, loginManager };
