import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["USER", "RECRUITER", "COMPANY_ADMIN", "MODERATOR", "ADMIN", "SUPER_ADMIN"],
      default: "USER",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    headline: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
