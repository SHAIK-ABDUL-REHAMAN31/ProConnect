import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    coverNote: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "APPLIED",
        "SCREENING",
        "SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "OFFER_EXTENDED",
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
    },
    feedbackNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);
export default Application;
