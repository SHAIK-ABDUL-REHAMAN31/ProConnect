import Notification from "./notification.model.js";

export class NotificationRepository {
  async findByRecipient(recipientId, limit = 50) {
    return Notification.find({ recipientId })
      .populate("senderId", "name username profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async create(notificationData) {
    const notification = new Notification(notificationData);
    return notification.save();
  }

  async markAsRead(id, recipientId) {
    return Notification.findOneAndUpdate(
      { _id: id, recipientId },
      { $set: { isRead: true } },
      { new: true }
    ).exec();
  }

  async markAllAsRead(recipientId) {
    return Notification.updateMany(
      { recipientId, isRead: false },
      { $set: { isRead: true } }
    ).exec();
  }
}

export const notificationRepository = new NotificationRepository();
