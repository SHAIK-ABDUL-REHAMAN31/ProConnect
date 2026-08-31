import { adminService } from "./admin.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getSystemStats();
      return ApiResponse.success(res, { stats }, "System statistics retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await adminService.getAllUsers(Number(page) || 1, Number(limit) || 20);
      return ApiResponse.success(res, data, "User list retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async toggleUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await adminService.toggleUserStatus(id);
      return ApiResponse.success(res, { user }, "User status updated.");
    } catch (error) {
      next(error);
    }
  }

  async createReport(req, res, next) {
    try {
      const { targetType, targetId, reason } = req.body;
      const report = await adminService.createReport({
        reporterId: req.user._id,
        targetType,
        targetId,
        reason,
      });
      return ApiResponse.created(res, { report }, "Report submitted successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const { status } = req.query;
      const reports = await adminService.getReports(status);
      return ApiResponse.success(res, { reports }, "Reports retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const { id } = req.params;
      const { actionTaken } = req.body;
      const report = await adminService.resolveReport(id, actionTaken);
      return ApiResponse.success(res, { report }, "Report resolved.");
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
