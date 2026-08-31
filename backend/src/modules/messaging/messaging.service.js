import { messagingRepository } from "./messaging.repository.js";
import { socketGateway } from "../../infrastructure/websocket/socketGateway.js";
import { BadRequestError } from "../../core/errors/AppError.js";

export class MessagingService {
  async getOrCreateConversation(userId, recipientId) {
    if (userId.toString() === recipientId.toString()) {
      throw new BadRequestError("Cannot start conversation with yourself.");
    }
    return messagingRepository.findOrCreateConversation(userId, recipientId);
  }

  async getUserConversations(userId) {
    return messagingRepository.getUserConversations(userId);
  }

  async getMessages(conversationId) {
    return messagingRepository.getMessagesByConversationId(conversationId);
  }

  async sendMessage(senderId, conversationId, content, mediaUrl = "") {
    if (!content && !mediaUrl) {
      throw new BadRequestError("Message must contain text or an attachment.");
    }

    const message = await messagingRepository.createMessage({
      conversationId,
      senderId,
      content,
      mediaUrl,
    });

    // Broadcast live message event to the conversation room
    socketGateway.emitToConversation(conversationId, "new_message", message);

    return message;
  }
}

export const messagingService = new MessagingService();
