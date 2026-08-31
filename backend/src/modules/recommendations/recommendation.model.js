import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    relationship: {
      type: String,
      enum: [
        "Managed directly",
        "Reported directly to",
        "Worked in the same team",
        "Worked on different teams",
        "Client / Service Provider",
        "Mentored / Advised",
      ],
      default: "Worked in the same team",
    },
    positionAtTheTime: { type: String, default: "" },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "HIDDEN"],
      default: "ACCEPTED",
    },
  },
  { timestamps: true }
);

const EndorsementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillName: { type: String, required: true },
    endorsedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Recommendation =
  mongoose.models.Recommendation || mongoose.model("Recommendation", RecommendationSchema);

export const Endorsement =
  mongoose.models.Endorsement || mongoose.model("Endorsement", EndorsementSchema);
