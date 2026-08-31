import User from "../users/user.model.js";
import Post from "../posts/post.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import Report from "./report.model.js";
import { NotFoundError } from "../../core/errors/AppError.js";

export class AdminService {
  async getSystemStats() {
    const [totalUsers, totalPosts, totalJobs, totalApplications, pendingReports] =
      await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
        Report.countDocuments({ status: "PENDING" }),
      ]);

    return {
      totalUsers,
      totalPosts,
      totalJobs,
      totalApplications,
      pendingReports,
      serverStatus: "HEALTHY",
      uptime: process.uptime(),
      nodeVersion: process.version,
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const count = await User.countDocuments();
    return { users, totalPages: Math.ceil(count / limit), totalUsers: count };
  }

  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found.");
    user.active = !user.active;
    await user.save();
    return user;
  }

  async createReport({ reporterId, targetType, targetId, reason }) {
    return Report.create({
      reporterId,
      targetType,
      targetId,
      reason,
    });
  }

  async getReports(status = "PENDING") {
    return Report.find({ status })
      .populate("reporterId", "name username profilePicture")
      .sort({ createdAt: -1 });
  }

  async resolveReport(reportId, actionTaken = "RESOLVED") {
    const report = await Report.findById(reportId);
    if (!report) throw new NotFoundError("Report not found.");
    report.status = "RESOLVED";
    report.actionTaken = actionTaken;
    await report.save();
    return report;
  }
}

export const adminService = new AdminService();
