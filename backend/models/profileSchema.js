import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  school: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
  },
  fieldOfStudy: {
    type: String,
    default: "",
  },
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
  grade: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

const workSchema = new mongoose.Schema({
  company: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "",
  },
  years: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    currentPost: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    pastWork: {
      type: [workSchema],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
