import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["none", "image", "video", "file"],
      default: "none",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityMessage",
      default: null,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CommunityMessage =
  mongoose.models.CommunityMessage ||
  mongoose.model("CommunityMessage", communityMessageSchema);

export default CommunityMessage;
