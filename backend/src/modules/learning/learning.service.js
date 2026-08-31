import learningRepository from "./learning.repository.js";
import { NotFoundError } from "../../core/errors/AppError.js";

class LearningService {
  async getCourses(category, level, search) {
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (level && level !== "All") filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skillsCovered: { $in: [new RegExp(search, "i")] } },
      ];
    }
    return await learningRepository.findCourses(filter);
  }

  async getCourseBySlug(slug) {
    const course = await learningRepository.findCourseBySlug(slug);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  }

  async enrollCourse(userId, courseId) {
    const course = await learningRepository.findCourseById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return await learningRepository.enrollUser(userId, courseId);
  }

  async getMyEnrollments(userId) {
    return await learningRepository.getUserEnrollments(userId);
  }

  async completeModule(userId, courseId, moduleIndex) {
    const enrollment = await learningRepository.updateProgress(userId, courseId, moduleIndex);
    if (!enrollment) throw new NotFoundError("Enrollment not found");
    return enrollment;
  }
}

export default new LearningService();
