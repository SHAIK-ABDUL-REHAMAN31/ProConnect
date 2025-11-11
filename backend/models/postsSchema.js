import mongoose from "mongoose";

const PostsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  body: {
    type: String,
    required: true,
  },

  likes: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  media: {
    type: String,
    default: "",
  },

  active: {
    type: Boolean,
    default: true,
  },

  fileType: {
    type: String,
    default: "",
  },
});

const Post = mongoose.model("Post", PostsSchema);
export default Post;
