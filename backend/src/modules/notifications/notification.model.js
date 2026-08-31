import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "CONNECTION_REQUEST",
        "CONNECTION_ACCEPTED",
        "POST_LIKE",
        "POST_COMMENT",
        "POST_MENTION",
        "NEW_MESSAGE",
        "JOB_APPLICATION_UPDATE",
        "JOB_RECOMMENDATION",
        "SYSTEM_ALERT",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId, // post, job, or application ID
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
export default Notification;
