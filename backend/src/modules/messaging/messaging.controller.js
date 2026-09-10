import { messagingService } from "./messaging.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class MessagingController {
  async getConversations(req, res, next) {
    try {
      const conversations = await messagingService.getUserConversations(req.user._id);
      return ApiResponse.success(res, { conversations }, "User conversations retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async startConversation(req, res, next) {
    try {
      const { recipientId } = req.body;
      const conversation = await messagingService.getOrCreateConversation(req.user._id, recipientId);
      return ApiResponse.success(res, { conversation }, "Conversation initialized.");
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const messages = await messagingService.getMessages(req.user._id, conversationId);
      return ApiResponse.success(res, { messages }, "Messages retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { conversationId, content, mediaUrl } = req.body;
      const message = await messagingService.sendMessage(
        req.user._id,
        conversationId,
        content,
        mediaUrl
      );
      return ApiResponse.created(res, { message }, "Message sent successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const messagingController = new MessagingController();
