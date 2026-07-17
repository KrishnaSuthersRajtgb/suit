const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Stored normalized (digits only) so lookups from the Visitor tab are reliable.
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: [
        "Safety Audit",
        "Site Inspection",
        "Contractor Work",
        "Delivery",
        "Meeting",
        "Other",
      ],
    },
    host: {
      type: String,
      required: true,
      trim: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["REGISTERED", "CHECKED_IN", "CHECKED_OUT"],
      default: "REGISTERED",
    },
    checkedInAt: {
      type: Date,
    },
    checkedOutAt: {
      type: Date,
    },
    // Safety video + quiz, tracked by the Visitor Dashboard / Assessment pages.
    induction: {
      status: {
        type: String,
        enum: ["PENDING", "PASSED", "FAILED"],
        default: "PENDING",
      },
      assessmentScore: { type: Number },
      assessmentTotal: { type: Number },
      attemptedAt: { type: Date },
      completedAt: { type: Date }, // set only when status flips to PASSED
    },
    // Issued once, after induction passes — the Visitor Pass page reads this.
    pass: {
      passId: { type: String },
      issuedAt: { type: Date },
      validUntil: { type: Date },
    },
  },
  { timestamps: { createdAt: "registeredAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Visitor", visitorSchema);