const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema(
  {
    plantCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    plantName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Plant", plantSchema);
