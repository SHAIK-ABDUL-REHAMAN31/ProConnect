import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: true,
      default: "Remote",
    },
    jobType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "HYBRID", "ON_SITE"],
      default: "FULL_TIME",
    },
    experienceLevel: {
      type: String,
      enum: ["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "LEAD", "EXECUTIVE"],
      default: "MID_LEVEL",
    },
    salaryRange: {
      type: String,
      default: "Competitive",
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "DRAFT"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
export default Job;
