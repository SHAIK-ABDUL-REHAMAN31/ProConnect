import { authService } from "./auth.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class AuthController {
  async register(req, res, next) {
    try {
      const clientMeta = { userAgent: req.get("user-agent") || "", ip: req.ip || "" };
      const result = await authService.register(req.body, clientMeta);
      return ApiResponse.created(res, result, "User registered successfully.");
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const clientMeta = { userAgent: req.get("user-agent") || "", ip: req.ip || "" };
      const result = await authService.login(req.body, clientMeta);
      return ApiResponse.success(res, result, "Login successful.");
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const clientMeta = { userAgent: req.get("user-agent") || "", ip: req.ip || "" };
      const result = await authService.googleAuth(req.body, clientMeta);
      return ApiResponse.success(res, result, "Google authentication successful.");
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.body?.refreshToken || req.headers["x-refresh-token"];
      const clientMeta = { userAgent: req.get("user-agent") || "", ip: req.ip || "" };
      const result = await authService.refreshTokens(refreshToken, clientMeta);
      return ApiResponse.success(res, result, "Token refreshed successfully.");
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.body?.refreshToken || req.headers["x-refresh-token"];
      const userId = req.user?._id;
      const result = await authService.logout({ refreshToken, userId });
      return ApiResponse.success(res, result, "Logged out successfully.");
    } catch (error) {
      next(error);
    }
  }

  async checkDns(req, res, next) {
    try {
      const email = req.body?.email || req.query?.email;
      const result = await authService.checkEmailDomain(email);
      return ApiResponse.success(res, result, "DNS MX record check completed.");
    } catch (error) {
      next(error);
    }
  }

  async checkUsername(req, res, next) {
    try {
      const username = req.query?.username || req.body?.username;
      const result = await authService.checkUsername(username);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async sendOtp(req, res, next) {
    try {
      const result = await authService.sendVerificationOtp(req.body);
      return ApiResponse.success(res, result, "Verification code sent to your email.");
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const result = await authService.verifyOtp(req.body);
      return ApiResponse.success(res, result, "Email verification successful.");
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
