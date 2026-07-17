const jwt = require("jsonwebtoken");
const { ApiError } = require("./errorHandler");

// Verifies the Bearer token issued at login and attaches the decoded
// payload ({ id, role, plant, username }) to req.user.
const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return next(new ApiError(401, "Not authorized. No token provided."));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    next(new ApiError(401, "Not authorized. Token invalid or expired."));
  }
};

// Usage: requireRole("ADMIN"), requireRole("ADMIN", "MANAGER")
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have access to this resource."));
  }
  next();
};

module.exports = { protect, requireRole };
