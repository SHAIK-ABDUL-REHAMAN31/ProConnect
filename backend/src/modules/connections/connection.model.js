import mongoose from "mongoose";

const ConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    status_accepted: {
      type: Boolean,
      default: null, // Legacy compatibility (null = pending, true = accepted, false = rejected)
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate connection requests in same direction
ConnectionSchema.index({ userId: 1, connectionId: 1 }, { unique: true });

const Connection =
  mongoose.models.ConnectionRequest ||
  mongoose.model("ConnectionRequest", ConnectionSchema);
export default Connection;
