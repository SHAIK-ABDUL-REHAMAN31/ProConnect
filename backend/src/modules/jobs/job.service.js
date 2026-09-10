import { jobRepository } from "./job.repository.js";
import { BadRequestError, NotFoundError } from "../../core/errors/AppError.js";
import { escapeRegex } from "../../core/utils/regex.util.js";

export class JobService {
  async createJob(recruiterId, jobData) {
    const { title, companyName, description, location } = jobData;
    if (!title || !companyName || !description) {
      throw new BadRequestError("Job title, company name, and description are required.");
    }

    return jobRepository.create({
      ...jobData,
      recruiterId,
      location: location || "Remote",
    });
  }

  async getAllJobs(query = {}) {
    const filter = { status: "OPEN" };

    if (query.search) {
      const safeSearch = escapeRegex(query.search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { companyName: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (query.jobType) {
      filter.jobType = query.jobType;
    }

    if (query.experienceLevel) {
      filter.experienceLevel = query.experienceLevel;
    }

    const limit = parseInt(query.limit) || 50;
    const skip = parseInt(query.skip) || 0;

    return jobRepository.findAll(filter, limit, skip);
  }

  async getJobById(id) {
    const job = await jobRepository.findById(id);
    if (!job) throw new NotFoundError("Job listing not found.");
    return job;
  }
}

export const jobService = new JobService();
