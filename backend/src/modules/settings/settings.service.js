import User from "../users/user.model.js";
import Profile from "../profiles/profile.model.js";
import bcrypt from "bcrypt";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError.js";

class SettingsService {
  async getUserSettings(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      user,
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: user.updatedAt,
        activeSessions: [
          {
            id: "sess_current",
            device: "Chrome / Windows 11",
            ip: "192.168.1.104",
            lastActive: "Active Now",
            isCurrent: true,
          },
          {
            id: "sess_mobile",
            device: "Safari / iOS 17.5",
            ip: "49.37.142.19",
            lastActive: "2 hours ago",
            isCurrent: false,
          },
        ],
      },
      privacy: {
        profileVisibility: "PUBLIC",
        openToWork: true,
        showOnlinePresence: true,
        allowDirectMessagesFrom: "EVERYONE",
      },
      notifications: {
        emailJobAlerts: true,
        emailConnectionRequests: true,
        pushMentions: true,
        marketingDigest: false,
      },
    };
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.password) {
      if (!currentPassword) {
        throw new BadRequestError("Current password is required to change password");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestError("Current password is incorrect");
      }
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters long");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: "Password updated securely" };
  }

  async exportUserData(userId) {
    const user = await User.findById(userId).select("-password");
    const profile = await Profile.findOne({ userId });

    return {
      exportedAt: new Date().toISOString(),
      account: user,
      profile: profile || {},
      status: "SUCCESS_GDPR_PACKAGE",
    };
  }
}

export default new SettingsService();
