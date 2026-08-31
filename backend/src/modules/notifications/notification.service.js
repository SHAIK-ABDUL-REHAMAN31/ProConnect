import Notification from "./notification.model.js";
import { notificationRepository } from "./notification.repository.js";
import { socketGateway } from "../../infrastructure/websocket/socketGateway.js";

export class NotificationService {
  async getNotifications(userId, limit = 50) {
    return notificationRepository.findByRecipient(userId, limit);
  }

  async sendNotification({ recipientId, senderId, type, message, entityId }) {
    const notification = await notificationRepository.create({
      recipientId,
      senderId,
      type,
      message,
      entityId,
    });

    const populated = await Notification.findById(notification._id).populate(
      "senderId",
      "name username profilePicture"
    );

    // Live push via WebSocket
    socketGateway.emitToUser(recipientId, "new_notification", populated);

    return populated;
  }

  async markAsRead(userId, notificationId) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
