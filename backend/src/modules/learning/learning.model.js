import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    instructor: {
      name: { type: String, required: true },
      title: { type: String, default: "" },
      avatar: { type: String, default: "" },
    },
    description: { type: String, default: "" },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "Beginner",
    },
    category: {
      type: String,
      enum: ["Software Engineering", "System Design", "Cloud & DevOps", "AI & Machine Learning", "Data & Analytics", "Product Management", "Leadership & Soft Skills"],
      default: "Software Engineering",
    },
    thumbnail: { type: String, default: "" },
    durationHours: { type: Number, default: 4 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    skillsCovered: [{ type: String }],
    modules: [
      {
        title: { type: String, required: true },
        durationMinutes: { type: Number, default: 20 },
        videoUrl: { type: String, default: "" },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    badgeTitle: { type: String, default: "" },
    badgeIcon: { type: String, default: "🎓" },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CourseSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

const CourseEnrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    progressPercentage: { type: Number, default: 0 },
    completedModules: [{ type: Number }], // indices of completed modules
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CourseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Course = mongoose.model("Course", CourseSchema);
export const CourseEnrollment = mongoose.model("CourseEnrollment", CourseEnrollmentSchema);
