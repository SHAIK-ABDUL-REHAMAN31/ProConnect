import { Recommendation, Endorsement } from "./recommendation.model.js";

class RecommendationRepository {
  async createRecommendation(data) {
    return await Recommendation.create(data);
  }

  async findByRecipient(recipientId, status = "ACCEPTED") {
    const filter = { recipientId };
    if (status !== "ALL") filter.status = status;
    return await Recommendation.find(filter)
      .populate("authorId", "name email username profilePicture headline")
      .sort({ createdAt: -1 });
  }

  async findByAuthor(authorId) {
    return await Recommendation.find({ authorId })
      .populate("recipientId", "name email username profilePicture headline")
      .sort({ createdAt: -1 });
  }

  async updateRecommendationStatus(id, recipientId, status) {
    return await Recommendation.findOneAndUpdate(
      { _id: id, recipientId },
      { status },
      { new: true }
    );
  }

  async toggleSkillEndorsement(userId, skillName, endorserId) {
    let endorsement = await Endorsement.findOne({ userId, skillName });
    if (!endorsement) {
      endorsement = await Endorsement.create({
        userId,
        skillName,
        endorsedBy: [endorserId],
      });
      return { endorsement, isEndorsed: true, count: 1 };
    }

    const idx = endorsement.endorsedBy.findIndex(
      (e) => e.toString() === endorserId.toString()
    );

    let isEndorsed = false;
    if (idx > -1) {
      endorsement.endorsedBy.splice(idx, 1);
      isEndorsed = false;
    } else {
      endorsement.endorsedBy.push(endorserId);
      isEndorsed = true;
    }

    await endorsement.save();
    return { endorsement, isEndorsed, count: endorsement.endorsedBy.length };
  }

  async getEndorsementsForUser(userId) {
    return await Endorsement.find({ userId }).populate(
      "endorsedBy",
      "name email username profilePicture headline"
    );
  }
}

export default new RecommendationRepository();
