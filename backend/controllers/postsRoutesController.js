import User from "../models/userSchema.js";
import Post from "../models/postsSchema.js";
import Comment from "../models/commentsSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const ActiveCheck = async (req, res) => {
  return res.status(200).json({ message: "Server status Running " });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let mediaUrl = "";
    let fileType = "";

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts_media",
      });

      mediaUrl = uploadResult.secure_url;
      fileType = req.file.mimetype.split("/")[1] || "";
    } else if (req.body.media) {
      mediaUrl = req.body.media;
    }

    const newPost = new Post({
      userId: user._id,
      body,
      media: mediaUrl,
      fileType,
    });

    await newPost.save();

    return res.status(201).json({
      message: "Post created successfully",
      cloud_url: mediaUrl,
      post: newPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res
      .status(500)
      .json({ message: "Server error during post creation." });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Get all posts error:", error);

    return res.status(500).json({ message: "Server error fetching posts." });
  }
};

export const deletePost = async (req, res) => {
  const { token, postId } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized." });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post." });
    }
    await Post.deleteOne({ _id: postId });

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete post error:", error);
    return res
      .status(500)
      .json({ message: "Server error during post deletion." });
  }
};

export const commentOnpost = async (req, res) => {
  const { token, postId, commentBody } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not ra ulfa nayala found." });
    }
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    const newComment = new Comment({
      postId: post._id,
      userId: user._id,
      commentBody: commentBody,
    });
    await newComment.save();
    return res
      .status(201)
      .json({ message: "Comment added successfully.", comment: newComment });
  } catch (error) {
    console.error("Comment on post error:", error);
    return res
      .status(500)
      .json({ message: "Server error during commenting on post." });
  }
};

export const getCommentsOnPost = async (req, res) => {
  const { postId } = req.query;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    const comments = await Comment.find({ postId: post._id }).populate(
      "userId",
      "username name profilePicture"
    );

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Server error fetching comments." });
  }
};

export const deleteUserComment = async (req, res) => {
  const { token, commentId } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized." });
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    await Comment.deleteOne({ _id: commentId });

    return res.status(200).json({ message: "comment deleted sucessfully" });
  } catch (err) {
    console.error("Error While Deleting comment: ", err);
    return res
      .status(500)
      .json({ message: "server Error While dleting comment" });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.body;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    post.likes = post.likes + 1;
    await post.save();
    return res
      .status(200)
      .json({ message: "Post liked successfully.", likes: post.likes });
  } catch (error) {
    console.error("Like post error:", error);
    return res
      .status(500)
      .json({ message: "Server error during liking post." });
  }
};
