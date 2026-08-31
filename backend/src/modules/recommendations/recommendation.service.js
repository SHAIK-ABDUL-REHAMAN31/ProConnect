import recommendationRepository from "./recommendation.repository.js";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError.js";

class RecommendationService {
  async giveRecommendation(authorId, payload) {
    if (authorId.toString() === payload.recipientId.toString()) {
      throw new BadRequestError("You cannot write a recommendation for yourself");
    }
    return await recommendationRepository.createRecommendation({
      authorId,
      recipientId: payload.recipientId,
      relationship: payload.relationship || "Worked in the same team",
      positionAtTheTime: payload.positionAtTheTime || "",
      text: payload.text,
      status: "ACCEPTED",
    });
  }

  async getRecommendationsForUser(userId) {
    const received = await recommendationRepository.findByRecipient(userId, "ACCEPTED");
    const given = await recommendationRepository.findByAuthor(userId);
    const endorsements = await recommendationRepository.getEndorsementsForUser(userId);
    return { received, given, endorsements };
  }

  async updateStatus(id, recipientId, status) {
    const updated = await recommendationRepository.updateRecommendationStatus(
      id,
      recipientId,
      status
    );
    if (!updated) {
      throw new NotFoundError("Recommendation not found");
    }
    return updated;
  }

  async toggleEndorsement(userId, skillName, endorserId) {
    if (userId.toString() === endorserId.toString()) {
      throw new BadRequestError("You cannot endorse your own skill");
    }
    return await recommendationRepository.toggleSkillEndorsement(
      userId,
      skillName,
      endorserId
    );
  }
}

export default new RecommendationService();
