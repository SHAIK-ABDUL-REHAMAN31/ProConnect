import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    commentBody: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export default Comment;
