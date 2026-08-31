import { communityService } from "./community.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class CommunityController {
  async createCommunity(req, res, next) {
    try {
      const community = await communityService.createCommunity(
        req.user.id || req.user._id,
        req.body,
        req.file
      );
      return ApiResponse.created(res, { community }, "Community created successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getCommunities(req, res, next) {
    try {
      const { category, search } = req.query;
      const communities = await communityService.getAllCommunities(category, search);
      return ApiResponse.success(res, { communities });
    } catch (error) {
      next(error);
    }
  }

  async getCommunityById(req, res, next) {
    try {
      const community = await communityService.getCommunityById(req.params.id);
      return ApiResponse.success(res, { community });
    } catch (error) {
      next(error);
    }
  }

  async toggleMembership(req, res, next) {
    try {
      const community = await communityService.toggleMembership(
        req.params.id,
        req.user.id || req.user._id
      );
      return ApiResponse.success(res, { community }, "Membership updated.");
    } catch (error) {
      next(error);
    }
  }

  async updateCommunitySettings(req, res, next) {
    try {
      const community = await communityService.updateCommunitySettings(
        req.params.id,
        req.user.id || req.user._id,
        req.body,
        req.file
      );
      return ApiResponse.success(res, { community }, "Community settings updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async manageModerator(req, res, next) {
    try {
      const { targetUserId, action } = req.body;
      const community = await communityService.manageModerator(
        req.params.id,
        req.user.id || req.user._id,
        targetUserId,
        action
      );
      return ApiResponse.success(res, { community }, "Moderator role updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const skip = parseInt(req.query.skip) || 0;
      const messages = await communityService.getMessages(req.params.id, limit, skip);
      return ApiResponse.success(res, { messages });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const message = await communityService.sendMessage(
        req.params.id,
        req.user.id || req.user._id,
        req.body,
        req.file
      );
      return ApiResponse.created(res, { message }, "Message posted.");
    } catch (error) {
      next(error);
    }
  }

  async voteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const { voteType } = req.body;
      const message = await communityService.voteMessage(
        req.params.id,
        messageId,
        req.user.id || req.user._id,
        voteType
      );
      return ApiResponse.success(res, { message }, "Vote updated.");
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const result = await communityService.deleteMessage(
        req.params.id,
        messageId,
        req.user.id || req.user._id
      );
      return ApiResponse.success(res, result, "Message deleted.");
    } catch (error) {
      next(error);
    }
  }

  async uploadMedia(req, res, next) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, "No file uploaded.", 400);
      }
      const fileUrl = req.file.path || req.file.secure_url;
      return ApiResponse.success(res, { url: fileUrl }, "File uploaded successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const communityController = new CommunityController();
