import learningService from "./learning.service.js";
import ApiResponse from "../../core/response/apiResponse.js";

class LearningController {
  async getAll(req, res, next) {
    try {
      const { category, level, search } = req.query;
      const courses = await learningService.getCourses(category, level, search);
      return ApiResponse.success(res, courses, "Courses fetched successfully");
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const course = await learningService.getCourseBySlug(req.params.slug);
      return ApiResponse.success(res, course, "Course details fetched");
    } catch (err) {
      next(err);
    }
  }

  async enroll(req, res, next) {
    try {
      const enrollment = await learningService.enrollCourse(req.user.id, req.body.courseId);
      return ApiResponse.success(res, enrollment, "Enrolled successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  async getMyEnrollments(req, res, next) {
    try {
      const enrollments = await learningService.getMyEnrollments(req.user.id);
      return ApiResponse.success(res, enrollments, "User enrollments fetched");
    } catch (err) {
      next(err);
    }
  }

  async completeModule(req, res, next) {
    try {
      const { courseId, moduleIndex } = req.body;
      const enrollment = await learningService.completeModule(req.user.id, courseId, moduleIndex);
      return ApiResponse.success(res, enrollment, "Module progress updated");
    } catch (err) {
      next(err);
    }
  }
}

export default new LearningController();
