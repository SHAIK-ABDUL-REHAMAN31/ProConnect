import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["POST", "USER", "COMMENT", "JOB"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "DISMISSED"],
      default: "PENDING",
    },
    actionTaken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);
export default Report;
