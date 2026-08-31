import Conversation from "./conversation.model.js";
import Message from "./message.model.js";

export class MessagingRepository {
  async findOrCreateConversation(user1Id, user2Id) {
    let conversation = await Conversation.findOne({
      participants: { $all: [user1Id, user2Id] },
    })
      .populate("participants", "name username profilePicture headline")
      .populate("lastMessage");

    if (!conversation) {
      conversation = new Conversation({
        participants: [user1Id, user2Id],
      });
      await conversation.save();
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name username profilePicture headline"
      );
    }

    return conversation;
  }

  async getUserConversations(userId) {
    return Conversation.find({ participants: userId })
      .populate("participants", "name username profilePicture headline")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessagesByConversationId(conversationId, limit = 100) {
    return Message.find({ conversationId })
      .populate("senderId", "name username profilePicture")
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async createMessage(data) {
    const message = new Message(data);
    await message.save();

    await Conversation.findByIdAndUpdate(data.conversationId, {
      $set: { lastMessage: message._id },
    });

    return Message.findById(message._id).populate("senderId", "name username profilePicture");
  }
}

export const messagingRepository = new MessagingRepository();
