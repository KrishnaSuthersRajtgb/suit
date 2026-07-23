const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: "A question needs at least 2 options.",
      },
    },
    correct: {
      type: Number,
      required: true,
      min: 0,
    },
    // null = shared across all plants; set = only shown for that plant.
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// `correct` must be a valid index into `options` — re-checked on every save,
// including updates (schema validators alone won't see updated array length
// reliably during a partial `findByIdAndUpdate`, so this uses .save() instead).
questionSchema.pre("validate", function (next) {
  if (this.options && this.correct >= this.options.length) {
    this.invalidate("correct", "`correct` must be a valid index into `options`.");
  }
  next();
});

module.exports = mongoose.model("Question", questionSchema);