import Comment from "./comment.model.js";
import { commentRepository } from "./comment.repository.js";
import { postRepository } from "../posts/post.repository.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../core/errors/AppError.js";

export class CommentService {
  async addComment(userId, postId, commentBody) {
    if (!commentBody || !commentBody.trim()) {
      throw new BadRequestError("Comment content cannot be empty.");
    }

    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Target post not found.");
    }

    const comment = await commentRepository.create({
      userId,
      postId,
      commentBody: commentBody.trim(),
    });

    await postRepository.incrementComments(postId, 1);

    return Comment.findById(comment._id).populate("userId", "name username profilePicture headline");
  }

  async getCommentsByPostId(postId) {
    return commentRepository.findByPostId(postId);
  }

  async deleteComment(userId, commentId) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found.");
    }

    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenError("You can only delete your own comments.");
    }

    await commentRepository.deleteById(commentId);
    await postRepository.incrementComments(comment.postId, -1);
    return true;
  }
}

export const commentService = new CommentService();
