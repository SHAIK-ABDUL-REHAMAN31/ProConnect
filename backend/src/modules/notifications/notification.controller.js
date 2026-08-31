import { notificationService } from "./notification.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const notifications = await notificationService.getNotifications(req.user._id, limit);
      return ApiResponse.success(res, { notifications }, "Notifications retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(req.user._id, id);
      return ApiResponse.success(res, { notification }, "Notification marked as read.");
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, null, "All notifications marked as read.");
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
