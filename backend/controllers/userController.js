const User = require("../models/User");
const Plant = require("../models/Plant");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

// Admin can only create these two roles from this endpoint — creating
// another ADMIN/EMPLOYEE/SUPPORT account isn't part of this flow.
const CREATABLE_ROLES = ["MANAGER", "SECURITY"];

// POST /api/users/staff
const createStaff = asyncHandler(async (req, res) => {
  const {
    username, password, role, fullName, email, phone,
    plant, employeeId, department, designation,
  } = req.body;

  if (!username || !password || !role || !plant) {
    throw new ApiError(400, "Username, password, role and plant are required.");
  }
  if (!CREATABLE_ROLES.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${CREATABLE_ROLES.join(", ")}.`);
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }

  const plantDoc = await Plant.findById(plant);
  if (!plantDoc) {
    throw new ApiError(400, "Selected plant was not found.");
  }

  const existing = await User.findOne({ username: username.trim().toLowerCase() });
  if (existing) {
    throw new ApiError(409, "That username is already taken.");
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    username: username.trim().toLowerCase(),
    passwordHash,
    role,
    fullName: fullName?.trim(),
    email: email?.trim(),
    phone: phone?.trim(),
    plant: plantDoc._id,
    employeeId: employeeId?.trim(),
    department: department?.trim(),
    designation: designation?.trim(),
    createdBy: req.user.id,
  });

  res.status(201).json(user); // toJSON transform on User already strips passwordHash
});

// GET /api/users/staff — list Security/Manager accounts for the admin panel.
const listStaff = asyncHandler(async (req, res) => {
  const { role, plant } = req.query;
  const filter = { role: { $in: CREATABLE_ROLES } };
  if (role && CREATABLE_ROLES.includes(role)) filter.role = role;
  if (plant) filter.plant = plant;

  const users = await User.find(filter)
    .populate("plant", "plantCode plantName")
    .sort({ createdAt: -1 });

  res.json(users);
});

module.exports = { createStaff, listStaff };