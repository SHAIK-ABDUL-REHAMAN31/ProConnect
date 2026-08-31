import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Webinar", "Live Workshop", "Tech Talk", "AMA", "Hackathon", "Networking"],
      default: "Webinar",
    },
    eventType: {
      type: String,
      enum: ["VIRTUAL", "IN_PERSON", "HYBRID"],
      default: "VIRTUAL",
    },
    eventDate: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    speakerName: { type: String, default: "" },
    speakerRole: { type: String, default: "" },
    speakerCompany: { type: String, default: "" },
    speakerAvatar: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    locationOrLink: { type: String, default: "ProConnect Virtual Stage" },
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxCapacity: { type: Number, default: 500 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
export default Event;
