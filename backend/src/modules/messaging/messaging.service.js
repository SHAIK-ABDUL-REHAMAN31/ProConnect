import { messagingRepository } from "./messaging.repository.js";
import Conversation from "./conversation.model.js";
import { socketGateway } from "../../infrastructure/websocket/socketGateway.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../core/errors/AppError.js";

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

  async getMessages(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found.");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ForbiddenError("You are not authorized to view this conversation.");
    }

    return messagingRepository.getMessagesByConversationId(conversationId);
  }

  async sendMessage(senderId, conversationId, content, mediaUrl = "") {
    if (!content && !mediaUrl) {
      throw new BadRequestError("Message must contain text or an attachment.");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found.");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );
    if (!isParticipant) {
      throw new ForbiddenError("You are not authorized to send messages in this conversation.");
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
