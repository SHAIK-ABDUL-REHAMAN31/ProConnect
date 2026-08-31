import { jobService } from "./job.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class JobController {
  async createJob(req, res, next) {
    try {
      const job = await jobService.createJob(req.user._id, req.body);
      return ApiResponse.created(res, { job }, "Job posted successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req, res, next) {
    try {
      const jobs = await jobService.getAllJobs(req.query);
      return ApiResponse.success(res, { jobs }, "Jobs retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req, res, next) {
    try {
      const { id } = req.params;
      const job = await jobService.getJobById(id);
      return ApiResponse.success(res, { job }, "Job details retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
