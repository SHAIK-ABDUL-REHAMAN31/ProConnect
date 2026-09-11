import { postRepository } from "./post.repository.js";
import Post from "./post.model.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../core/errors/AppError.js";
import { cacheService } from "../../infrastructure/cache/cacheService.js";

export class PostService {
  async createPost(userId, { body, poll }, file) {
    if (!body && !file && !poll) {
      throw new BadRequestError("Post must contain text content, a media file, or a poll.");
    }

    let mediaUrl = "";
    let fileType = "";

    if (file) {
      mediaUrl = file.path;
      fileType = file.mimetype.split("/")[0] || "image";
    }

    let pollData = null;
    if (poll && poll.question && poll.options?.length >= 2) {
      pollData = {
        question: poll.question,
        options: poll.options.map((opt) => ({ text: opt, votes: [] })),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };
    }

    const post = await postRepository.create({
      userId,
      body: body || "",
      media: mediaUrl,
      fileType,
      poll: pollData,
    });

    // Write-Through Invalidation: purge all cached feed pages
    await cacheService.delPattern("cache:feed:*");

    return postRepository.findById(post._id);
  }

  async getAllPosts(limit = 50, skip = 0) {
    const cacheKey = `cache:feed:${limit}:${skip}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return { posts: cached.data, fromCache: true };
    }

    const posts = await postRepository.findAll(limit, skip);
    await cacheService.set(cacheKey, posts, 60); // 60s TTL
    return { posts, fromCache: false };
  }

  async deletePost(userId, postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    if (post.userId._id.toString() !== userId.toString()) {
      throw new ForbiddenError("You are not authorized to delete this post.");
    }

    const result = await postRepository.deleteById(postId);

    // Invalidate cached feed pages
    await cacheService.delPattern("cache:feed:*");

    return result;
  }

  async likePost(postId) {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError("Post not found.");
    const updated = await postRepository.incrementLikes(postId, 1);

    // Invalidate cached feed
    await cacheService.delPattern("cache:feed:*");
    return updated;
  }

  async dislikePost(postId) {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError("Post not found.");
    const currentLikes = post.likesCount || 0;
    if (currentLikes <= 0) return post;
    const updated = await postRepository.incrementLikes(postId, -1);

    // Invalidate cached feed
    await cacheService.delPattern("cache:feed:*");
    return updated;
  }

  async getPostsByTopic(tag, limit = 50, skip = 0) {
    const normalizedTag = tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    return await Post.find({ tags: normalizedTag, active: true })
      .populate("userId", "name email username profilePicture headline")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}

export const postService = new PostService();
