import { applicationService } from "./application.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class ApplicationController {
  async apply(req, res, next) {
    try {
      const application = await applicationService.applyForJob(req.user._id, req.body);
      return ApiResponse.created(res, { application }, "Application submitted successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req, res, next) {
    try {
      const applications = await applicationService.getCandidateApplications(req.user._id);
      return ApiResponse.success(res, { applications }, "Applications retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getJobApplications(req, res, next) {
    try {
      const { jobId } = req.params;
      const applications = await applicationService.getJobApplications(jobId);
      return ApiResponse.success(res, { applications }, "Job applicants retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, feedbackNotes } = req.body;
      const application = await applicationService.updateApplicationStatus(id, status, feedbackNotes);
      return ApiResponse.success(res, { application }, "Application status updated.");
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
