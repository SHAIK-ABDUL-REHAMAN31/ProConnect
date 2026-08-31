import Community from "./community.model.js";
import CommunityMessage from "./communityMessage.model.js";

export class CommunityRepository {
  async create(data) {
    return Community.create(data);
  }

  async findById(id) {
    return Community.findById(id)
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  async findBySlug(slug) {
    return Community.findOne({ slug })
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  async findAll(query = {}) {
    return Community.find(query)
      .populate("creatorId", "name username profilePicture headline")
      .populate("moderators", "name username profilePicture headline")
      .sort({ createdAt: -1 });
  }

  async update(communityId, updateData) {
    return Community.findByIdAndUpdate(communityId, updateData, { new: true })
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  async addMember(communityId, userId) {
    return Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  async removeMember(communityId, userId) {
    return Community.findByIdAndUpdate(
      communityId,
      { 
        $pull: { 
          members: userId,
          moderators: userId 
        } 
      },
      { new: true }
    )
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  async addModerator(communityId, userId) {
    return Community.findByIdAndUpdate(
      communityId,
      { 
        $addToSet: { 
          moderators: userId,
          members: userId 
        } 
      },
      { new: true }
    )
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  async removeModerator(communityId, userId) {
    return Community.findByIdAndUpdate(
      communityId,
      { $pull: { moderators: userId } },
      { new: true }
    )
      .populate("creatorId", "name username email profilePicture headline")
      .populate("moderators", "name username email profilePicture headline")
      .populate("members", "name username email profilePicture headline");
  }

  // --- Messages & Chat Repository ---
  async findMessages(communityId, limit = 50, skip = 0) {
    return CommunityMessage.find({ communityId })
      .populate("senderId", "name username profilePicture headline")
      .populate({
        path: "replyTo",
        select: "content mediaUrl senderId",
        populate: {
          path: "senderId",
          select: "name username profilePicture",
        },
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
  }

  async findMessageById(messageId) {
    return CommunityMessage.findById(messageId)
      .populate("senderId", "name username profilePicture headline")
      .populate({
        path: "replyTo",
        select: "content mediaUrl senderId",
        populate: {
          path: "senderId",
          select: "name username profilePicture",
        },
      });
  }

  async createMessage(data) {
    const message = await CommunityMessage.create(data);
    return this.findMessageById(message._id);
  }

  async voteMessage(messageId, userId, voteType) {
    const msg = await CommunityMessage.findById(messageId);
    if (!msg) return null;

    const uIdStr = userId.toString();
    const hasUpvoted = msg.upvotes.some((u) => u.toString() === uIdStr);
    const hasDownvoted = msg.downvotes.some((u) => u.toString() === uIdStr);

    if (voteType === "upvote") {
      if (hasUpvoted) {
        msg.upvotes = msg.upvotes.filter((u) => u.toString() !== uIdStr);
      } else {
        msg.upvotes.push(userId);
        msg.downvotes = msg.downvotes.filter((u) => u.toString() !== uIdStr);
      }
    } else if (voteType === "downvote") {
      if (hasDownvoted) {
        msg.downvotes = msg.downvotes.filter((u) => u.toString() !== uIdStr);
      } else {
        msg.downvotes.push(userId);
        msg.upvotes = msg.upvotes.filter((u) => u.toString() !== uIdStr);
      }
    }

    await msg.save();
    return this.findMessageById(messageId);
  }

  async deleteMessage(messageId) {
    return CommunityMessage.findByIdAndDelete(messageId);
  }
}

export const communityRepository = new CommunityRepository();
