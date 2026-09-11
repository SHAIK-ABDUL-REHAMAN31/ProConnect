import codeCollabService from "./codecollab.service.js";
import codeRunnerService from "../../infrastructure/runner/codeRunnerService.js";
import ApiResponse from "../../core/response/apiResponse.js";

class CodeCollabController {
  async create(req, res, next) {
    try {
      const session = await codeCollabService.createSession(req.user.id, req.body);
      return ApiResponse.success(res, session, "Session created successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  async getSession(req, res, next) {
    try {
      const session = await codeCollabService.getSession(req.params.sessionId);
      return ApiResponse.success(res, session, "Session details");
    } catch (err) {
      next(err);
    }
  }

  async syncCode(req, res, next) {
    try {
      const { code, language } = req.body;
      const session = await codeCollabService.syncCode(req.params.sessionId, code, language);
      return ApiResponse.success(res, session, "Code synchronized");
    } catch (err) {
      next(err);
    }
  }

  async joinSession(req, res, next) {
    try {
      const session = await codeCollabService.joinSession(req.params.sessionId, req.user.id);
      return ApiResponse.success(res, session, "Joined session successfully");
    } catch (err) {
      next(err);
    }
  }

  async execute(req, res, next) {
    try {
      const { language, code, problemId, testCases, isSubmission } = req.body;
      const result = await codeRunnerService.execute({
        language,
        code,
        problemId,
        testCases,
        isSubmission,
      });
      return ApiResponse.success(res, result, "Code executed successfully");
    } catch (err) {
      next(err);
    }
  }
}

export default new CodeCollabController();
