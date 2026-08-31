import Job from "./job.model.js";

export class JobRepository {
  async findById(id) {
    return Job.findById(id)
      .populate("recruiterId", "name username email profilePicture")
      .populate("companyId")
      .exec();
  }

  async create(jobData) {
    const job = new Job(jobData);
    return job.save();
  }

  async findAll(filter = {}, limit = 50, skip = 0) {
    return Job.find(filter)
      .populate("recruiterId", "name username profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async incrementApplicants(id) {
    return Job.findByIdAndUpdate(id, { $inc: { applicantsCount: 1 } }, { new: true }).exec();
  }
}

export const jobRepository = new JobRepository();
