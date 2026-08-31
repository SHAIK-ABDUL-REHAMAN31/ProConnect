import settingsService from "./settings.service.js";
import ApiResponse from "../../core/response/apiResponse.js";

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const data = await settingsService.getUserSettings(req.user.id);
      return ApiResponse.success(res, "Settings retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await settingsService.updatePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      return ApiResponse.success(res, "Password updated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async exportData(req, res, next) {
    try {
      const data = await settingsService.exportUserData(req.user.id);
      return ApiResponse.success(res, "User data archive ready", data);
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
