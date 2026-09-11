import Notification from "../../modules/notifications/notification.model.js";
import User from "../../modules/users/user.model.js";
import { socketGateway } from "../websocket/socketGateway.js";
import emailService from "../email/emailService.js";
import logger from "../logger/logger.js";

// ───────────────────────────────────────────────────────────
// Notification Dispatcher & Async Digest Aggregator
// ───────────────────────────────────────────────────────────

export class NotificationDispatcher {
  /**
   * Dispatch notification across configured channels (WebSocket + Async Email).
   */
  async dispatch(notification, populatedData = null) {
    try {
      const recipientId = notification.recipientId?.toString();
      const recipient = await User.findById(recipientId);
      if (!recipient) return;

      // 1. Live WebSocket Push
      socketGateway.emitToUser(
        recipientId,
        "new_notification",
        populatedData || notification
      );

      const prefs = recipient.notificationPreferences || {
        emailNotifications: true,
        connectionRequests: true,
        messages: true,
        postInteractions: true,
        jobAlerts: true,
        emailDigest: "daily",
      };

      if (!prefs.emailNotifications) {
        return; // User has turned off email notifications
      }

      // 2. Check if instant notification is requested
      if (prefs.emailDigest === "instant") {
        await emailService.sendDigestEmail(
          recipient.email,
          recipient.name,
          [notification],
          "Instant"
        );
      }
    } catch (err) {
      logger.error("Failed in notification dispatcher", { error: err.message });
    }
  }

  /**
   * Run background batch digest for users with daily/weekly preferences
   */
  async processDigests(frequency = "daily") {
    logger.info(`Running ${frequency} notification digest aggregator`);

    try {
      const users = await User.find({
        "notificationPreferences.emailNotifications": true,
        "notificationPreferences.emailDigest": frequency,
      });

      let sentCount = 0;

      for (const user of users) {
        // Find unread notifications from the last 24h (or 7 days)
        const timeWindow =
          frequency === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const since = new Date(Date.now() - timeWindow);

        const unreadNotifications = await Notification.find({
          recipientId: user._id,
          isRead: false,
          createdAt: { $gte: since },
        })
          .sort({ createdAt: -1 })
          .limit(10);

        if (unreadNotifications.length > 0) {
          await emailService.sendDigestEmail(
            user.email,
            user.name,
            unreadNotifications,
            frequency.charAt(0).toUpperCase() + frequency.slice(1)
          );
          sentCount++;
        }
      }

      logger.info(`Digest processing complete. Dispatched ${sentCount} digests.`);
      return { success: true, processedUsers: users.length, sentDigests: sentCount };
    } catch (err) {
      logger.error("Error processing digests", { error: err.message });
      throw err;
    }
  }
}

export const notificationDispatcher = new NotificationDispatcher();
