import { profileService } from "./profile.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class ProfileController {
  async getMyProfile(req, res, next) {
    try {
      const profile = await profileService.getProfileByUserId(req.user._id);
      return ApiResponse.success(res, { profile }, "User profile retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getProfileByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const userProfile = await profileService.getProfileByUsername(username);
      return ApiResponse.success(res, { userProfile }, "Public profile retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await profileService.updateProfile(req.user._id, req.body);
      return ApiResponse.success(res, { profile }, "Profile updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getAllProfiles(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;
      const profiles = await profileService.getAllProfiles(limit, skip);
      return ApiResponse.success(res, { profiles }, "All profiles retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
