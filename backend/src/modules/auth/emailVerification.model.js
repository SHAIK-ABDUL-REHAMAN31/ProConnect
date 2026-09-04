import mongoose from "mongoose";

const EmailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "15m" }, // Auto-delete document after 15 minutes
    },
  },
  {
    timestamps: true,
  }
);

const EmailVerification =
  mongoose.models.EmailVerification ||
  mongoose.model("EmailVerification", EmailVerificationSchema);

export default EmailVerification;
