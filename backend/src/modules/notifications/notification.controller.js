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

  async getPreferences(req, res, next) {
    try {
      const preferences = await notificationService.getPreferences(req.user._id);
      return ApiResponse.success(res, { preferences }, "Notification preferences retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const preferences = await notificationService.updatePreferences(req.user._id, req.body);
      return ApiResponse.success(res, { preferences }, "Notification preferences updated.");
    } catch (error) {
      next(error);
    }
  }

  async triggerDigest(req, res, next) {
    try {
      const frequency = req.query.frequency || req.body?.frequency || "daily";
      const result = await notificationService.triggerDigest(frequency);
      return ApiResponse.success(res, result, `Digest triggered for frequency: ${frequency}`);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
