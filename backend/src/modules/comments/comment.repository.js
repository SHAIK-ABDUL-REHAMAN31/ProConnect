import Comment from "./comment.model.js";

export class CommentRepository {
  async findByPostId(postId) {
    return Comment.find({ postId })
      .populate("userId", "name username email profilePicture headline")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id) {
    return Comment.findById(id).exec();
  }

  async create(commentData) {
    const comment = new Comment(commentData);
    return comment.save();
  }

  async deleteById(id) {
    return Comment.findByIdAndDelete(id).exec();
  }
}

export const commentRepository = new CommentRepository();
