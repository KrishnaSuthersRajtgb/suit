const mongoose = require("mongoose");

// A collection rather than one hardcoded doc — old videos stay in history
// when replaced. The assessment flow always reads whichever doc within its
// scope (plant, or global) currently has isActive: true.
const inductionVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Site Safety Induction",
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      default: null, // null = applies to all plants
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InductionVideo", inductionVideoSchema);