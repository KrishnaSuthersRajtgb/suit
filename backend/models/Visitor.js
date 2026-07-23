const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// Full visitor journey, in order. `status` is now the SINGLE source of truth —
// it replaces the old split between `status` (gate) and `induction.status`.
//
//   DRAFT → INVITED → INDUCTION_STARTED → VIDEO_COMPLETED → ASSESSMENT_PASSED
//         → PASS_GENERATED → CHECKED_IN → CHECKED_OUT → CLOSED
//
// Exception / terminal states, reachable from various points in the pipeline
// above (see TRANSITIONS in visitorController.js for exactly which):
//   FAILED_ASSESSMENT, EXPIRED, REJECTED, CANCELLED
// ─────────────────────────────────────────────────────────────────────────────
const VISITOR_STATUSES = [
  "DRAFT",
  "INVITED",
  "INDUCTION_STARTED",
  "VIDEO_COMPLETED",
  "ASSESSMENT_PASSED",
  "PASS_GENERATED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CLOSED",
  "FAILED_ASSESSMENT",
  "EXPIRED",
  "REJECTED",
  "CANCELLED",
];

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

    // Single status drives the whole journey. Manager's registerVisitor
    // creates records already at INVITED — Security does NOT see these until
    // the visitor has completed induction and a pass has been generated.
    status: {
      type: String,
      enum: VISITOR_STATUSES,
      default: "INVITED",
    },

    // Append-only audit trail — every transition pushes an entry here.
    statusHistory: [
      {
        status: { type: String, enum: VISITOR_STATUSES },
        at: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],

    // Per-stage timestamps — handy for dashboards/reporting without having
    // to scan statusHistory every time.
    invitedAt: { type: Date },
    inductionStartedAt: { type: Date },
    videoCompletedAt: { type: Date },
    assessmentPassedAt: { type: Date },
    passGeneratedAt: { type: Date },
    checkedInAt: { type: Date },
    checkedOutAt: { type: Date },
    closedAt: { type: Date },

    failedAssessmentAt: { type: Date },
    expiredAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    cancelledAt: { type: Date },

    // Safety video + quiz detail — score history kept even though the
    // pass/fail *flow* now lives entirely on `status`.
    induction: {
      assessmentScore: { type: Number },
      assessmentTotal: { type: Number },
      attemptedAt: { type: Date },
      attempts: { type: Number, default: 0 },
    },

    // Issued once, when status flips to PASS_GENERATED.
    pass: {
      passId: { type: String },
      issuedAt: { type: Date },
      validUntil: { type: Date },
    },
  },
  { timestamps: { createdAt: "registeredAt", updatedAt: "updatedAt" } }
);

visitorSchema.statics.STATUSES = VISITOR_STATUSES;

module.exports = mongoose.model("Visitor", visitorSchema);