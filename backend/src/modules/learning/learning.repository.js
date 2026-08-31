import { Course, CourseEnrollment } from "./learning.model.js";

class LearningRepository {
  async findCourses(filter = {}, limit = 50, skip = 0) {
    return await Course.find(filter)
      .sort({ enrolledCount: -1, rating: -1 })
      .skip(skip)
      .limit(limit);
  }

  async findCourseById(id) {
    return await Course.findById(id);
  }

  async findCourseBySlug(slug) {
    return await Course.findOne({ slug });
  }

  async createCourse(courseData) {
    return await Course.create(courseData);
  }

  async enrollUser(userId, courseId) {
    let enrollment = await CourseEnrollment.findOne({ userId, courseId });
    if (!enrollment) {
      enrollment = await CourseEnrollment.create({ userId, courseId });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    }
    return enrollment;
  }

  async getUserEnrollments(userId) {
    return await CourseEnrollment.find({ userId })
      .populate("courseId")
      .sort({ lastAccessedAt: -1 });
  }

  async updateProgress(userId, courseId, moduleIndex) {
    const enrollment = await CourseEnrollment.findOne({ userId, courseId });
    if (!enrollment) return null;

    if (!enrollment.completedModules.includes(moduleIndex)) {
      enrollment.completedModules.push(moduleIndex);
    }

    const course = await Course.findById(courseId);
    if (course && course.modules.length > 0) {
      const percentage = Math.round((enrollment.completedModules.length / course.modules.length) * 100);
      enrollment.progressPercentage = Math.min(100, percentage);
      if (enrollment.progressPercentage >= 100 && !enrollment.isCompleted) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
      }
    }
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
    return enrollment;
  }
}

export default new LearningRepository();
