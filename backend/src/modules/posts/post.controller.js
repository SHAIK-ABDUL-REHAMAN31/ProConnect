import { postService } from "./post.service.js";
import ApiResponse from "../../core/response/apiResponse.js";

export class PostController {
  async createPost(req, res, next) {
    try {
      const post = await postService.createPost(req.user.id || req.user._id, req.body, req.file);
      return ApiResponse.created(res, "Post created successfully.", { post });
    } catch (error) {
      next(error);
    }
  }

  async getAllPosts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;
      const posts = await postService.getAllPosts(limit, skip);
      return ApiResponse.success(res, "Posts retrieved successfully.", { posts });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const postId = req.params.id || req.body.postId;
      await postService.deletePost(req.user.id || req.user._id, postId);
      return ApiResponse.success(res, "Post deleted successfully.", null);
    } catch (error) {
      next(error);
    }
  }

  async likePost(req, res, next) {
    try {
      const postId = req.params.id || req.body.postId;
      const post = await postService.likePost(postId);
      return ApiResponse.success(res, "Post liked successfully.", { likes: post.likesCount });
    } catch (error) {
      next(error);
    }
  }

  async dislikePost(req, res, next) {
    try {
      const postId = req.params.id || req.body.postId;
      const post = await postService.dislikePost(postId);
      return ApiResponse.success(res, "Post disliked successfully.", { likes: post.likesCount });
    } catch (error) {
      next(error);
    }
  }

  async getByTopic(req, res, next) {
    try {
      const posts = await postService.getPostsByTopic(req.params.tag);
      return ApiResponse.success(res, "Topic posts retrieved", posts);
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
