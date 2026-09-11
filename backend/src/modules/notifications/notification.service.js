import Notification from "./notification.model.js";
import { notificationRepository } from "./notification.repository.js";
import { notificationDispatcher } from "../../infrastructure/notifications/notificationDispatcher.js";
import User from "../users/user.model.js";

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

    // Multi-channel dispatch (Live WebSocket + Async Email)
    await notificationDispatcher.dispatch(notification, populated);

    return populated;
  }

  async markAsRead(userId, notificationId) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  async getPreferences(userId) {
    const user = await User.findById(userId).select("notificationPreferences");
    return (
      user?.notificationPreferences || {
        emailNotifications: true,
        connectionRequests: true,
        messages: true,
        postInteractions: true,
        jobAlerts: true,
        emailDigest: "daily",
      }
    );
  }

  async updatePreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.notificationPreferences = {
      ...(user.notificationPreferences || {}),
      ...preferences,
    };
    await user.save();
    return user.notificationPreferences;
  }

  async triggerDigest(frequency = "daily") {
    return notificationDispatcher.processDigests(frequency);
  }
}

export const notificationService = new NotificationService();
