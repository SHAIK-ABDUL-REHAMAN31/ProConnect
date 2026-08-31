import recommendationService from "./recommendation.service.js";
import ApiResponse from "../../core/response/apiResponse.js";

class RecommendationController {
  async give(req, res, next) {
    try {
      const rec = await recommendationService.giveRecommendation(req.user.id, req.body);
      return ApiResponse.created(res, "Recommendation submitted", rec);
    } catch (error) {
      next(error);
    }
  }

  async getForUser(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const data = await recommendationService.getRecommendationsForUser(userId);
      return ApiResponse.success(res, "Recommendations retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const updated = await recommendationService.updateStatus(
        req.params.id,
        req.user.id,
        req.body.status
      );
      return ApiResponse.success(res, "Recommendation status updated", updated);
    } catch (error) {
      next(error);
    }
  }

  async toggleEndorsement(req, res, next) {
    try {
      const { userId, skillName } = req.body;
      const result = await recommendationService.toggleEndorsement(
        userId,
        skillName,
        req.user.id
      );
      return ApiResponse.success(
        res,
        result.isEndorsed ? "Skill endorsed" : "Skill endorsement removed",
        result
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new RecommendationController();
