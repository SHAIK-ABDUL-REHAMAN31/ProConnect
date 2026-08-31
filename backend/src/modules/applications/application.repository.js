import Application from "./application.model.js";

export class ApplicationRepository {
  async findByJobAndCandidate(jobId, candidateId) {
    return Application.findOne({ jobId, candidateId }).exec();
  }

  async create(data) {
    const application = new Application(data);
    return application.save();
  }

  async findByCandidate(candidateId) {
    return Application.find({ candidateId })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByJob(jobId) {
    return Application.find({ jobId })
      .populate("candidateId", "name username email profilePicture headline")
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(applicationId, status, feedbackNotes = "") {
    return Application.findByIdAndUpdate(
      applicationId,
      { $set: { status, feedbackNotes } },
      { new: true }
    )
      .populate("candidateId", "name username email")
      .populate("jobId", "title companyName")
      .exec();
  }
}

export const applicationRepository = new ApplicationRepository();
