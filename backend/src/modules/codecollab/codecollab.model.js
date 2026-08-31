import mongoose from "mongoose";

const CodingSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    title: { type: String, default: "Live Code Collab Session" },
    language: {
      type: String,
      enum: ["javascript", "python", "go", "rust", "typescript"],
      default: "javascript",
    },
    code: { type: String, default: "" },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    challengePreset: {
      name: { type: String, default: "Custom Scratchpad" },
      prompt: { type: String, default: "" },
      testCases: [
        {
          input: { type: String },
          expectedOutput: { type: String },
        },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CodingSession = mongoose.model("CodingSession", CodingSessionSchema);
