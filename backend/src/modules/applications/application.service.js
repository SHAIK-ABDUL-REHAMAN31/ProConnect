import { applicationRepository } from "./application.repository.js";
import { jobRepository } from "../jobs/job.repository.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../core/errors/AppError.js";
import { socketGateway } from "../../infrastructure/websocket/socketGateway.js";
import Application from "./application.model.js";

export class ApplicationService {
  async applyForJob(candidateId, { jobId, resumeUrl, coverNote }) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError("Job listing not found.");
    }

    const existing = await applicationRepository.findByJobAndCandidate(jobId, candidateId);
    if (existing) {
      throw new BadRequestError("You have already applied for this position.");
    }

    const application = await applicationRepository.create({
      jobId,
      candidateId,
      resumeUrl: resumeUrl || "",
      coverNote: coverNote || "",
      status: "APPLIED",
    });

    await jobRepository.incrementApplicants(jobId);

    // Notify recruiter
    if (job.recruiterId) {
      socketGateway.emitToUser(job.recruiterId._id, "new_notification", {
        type: "JOB_APPLICATION_UPDATE",
        message: `New applicant for ${job.title}`,
        entityId: application._id,
      });
    }

    return application;
  }

  async getCandidateApplications(candidateId) {
    return applicationRepository.findByCandidate(candidateId);
  }

  async getJobApplications(jobId, user) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError("Job listing not found.");
    }

    const isRecruiter = (job.recruiterId?._id || job.recruiterId)?.toString() === user._id.toString();
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isRecruiter && !isAdmin) {
      throw new ForbiddenError("Only the job recruiter or an administrator can view applicants.");
    }

    return applicationRepository.findByJob(jobId);
  }

  async updateApplicationStatus(applicationId, status, feedbackNotes = "", user) {
    const existing = await Application.findById(applicationId).populate("jobId");
    if (!existing) {
      throw new NotFoundError("Application record not found.");
    }

    const isRecruiter =
      (existing.jobId?.recruiterId?._id || existing.jobId?.recruiterId)?.toString() === user._id.toString();
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isRecruiter && !isAdmin) {
      throw new ForbiddenError("Only the job recruiter or an administrator can update this application.");
    }

    const updated = await applicationRepository.updateStatus(applicationId, status, feedbackNotes);
    if (!updated) {
      throw new NotFoundError("Application record not found.");
    }

    // Notify candidate of status update
    if (updated.candidateId) {
      socketGateway.emitToUser(updated.candidateId._id, "new_notification", {
        type: "JOB_APPLICATION_UPDATE",
        message: `Your application for ${updated.jobId?.title || "the position"} was updated to: ${status}`,
        entityId: updated._id,
      });
    }

    return updated;
  }
}

export const applicationService = new ApplicationService();
