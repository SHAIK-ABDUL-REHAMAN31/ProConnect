import mongoose from "mongoose";

const SavedItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["POST", "JOB", "ARTICLE", "PROFILE"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    link: { type: String, default: "" },
    collectionName: { type: String, default: "Default" },
    notes: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const SavedItem = mongoose.models.SavedItem || mongoose.model("SavedItem", SavedItemSchema);
export default SavedItem;
