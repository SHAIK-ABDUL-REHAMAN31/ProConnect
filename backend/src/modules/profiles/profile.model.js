import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  school: { type: String, default: "" },
  degree: { type: String, default: "" },
  fieldOfStudy: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
});

const WorkSchema = new mongoose.Schema({
  company: { type: String, default: "" },
  position: { type: String, default: "" },
  years: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  description: { type: String, default: "" },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  link: { type: String, default: "" },
  githubUrl: { type: String, default: "" },
  technologies: { type: [String], default: [] },
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  issuer: { type: String, default: "" },
  issueDate: { type: String, default: "" },
  credentialUrl: { type: String, default: "" },
});

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: { type: String, default: "" },
    about: { type: String, default: "" },
    currentPost: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    githubUsername: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    twitterHandle: { type: String, default: "" },
    skills: { type: [String], default: [] },
    pastWork: { type: [WorkSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    profileViewsCount: { type: Number, default: 0 },
    resumeUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export default Profile;
