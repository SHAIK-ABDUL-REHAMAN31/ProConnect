import { authService } from "./auth.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.created(res, result, "User registered successfully.");
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return ApiResponse.success(res, result, "Login successful.");
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      return ApiResponse.success(res, { user: req.user }, "Current session user profile.");
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      const result = await authService.updateAvatar(req.user._id, req.file);
      return ApiResponse.success(res, result, "Profile avatar updated successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
