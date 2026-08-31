import mongoose from "mongoose";

const PollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: [true, "Post content cannot be empty"],
      trim: true,
    },
    media: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    poll: {
      question: { type: String, default: "" },
      options: [PollOptionSchema],
      expiresAt: { type: Date },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Extract hashtags automatically before saving
PostSchema.pre("save", function (next) {
  if (this.isModified("body") && this.body) {
    const matchedTags = this.body.match(/#[a-zA-Z0-9_]+/g);
    this.tags = matchedTags ? matchedTags.map((t) => t.toLowerCase()) : [];
  }
  next();
});

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
export default Post;
