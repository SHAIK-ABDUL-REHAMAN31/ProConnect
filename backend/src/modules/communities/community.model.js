import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Frontend", "Backend", "AI & ML", "DevOps & Cloud", "Mobile", "Career & Startups", "General"],
      default: "General",
    },
    icon: {
      type: String,
      default: "🚀",
    },
    banner: {
      type: String,
      default: "",
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rules: [String],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Community =
  mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;

