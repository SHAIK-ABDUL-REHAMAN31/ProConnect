import { commentService } from "./comment.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class CommentController {
  async addComment(req, res, next) {
    try {
      const { postId, commentBody } = req.body;
      const comment = await commentService.addComment(req.user._id, postId, commentBody);
      return ApiResponse.created(res, { comment }, "Comment added successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const { postId } = req.params;
      const comments = await commentService.getCommentsByPostId(postId);
      return ApiResponse.success(res, { comments }, "Comments retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;
      await commentService.deleteComment(req.user._id, commentId);
      return ApiResponse.success(res, null, "Comment deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
