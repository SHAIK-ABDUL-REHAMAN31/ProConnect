import { CodingSession } from "./codecollab.model.js";

class CodeCollabRepository {
  async createSession(data) {
    return await CodingSession.create(data);
  }

  async findBySessionId(sessionId) {
    return await CodingSession.findOne({ sessionId })
      .populate("creatorId", "name username headline profilePicture")
      .populate("participants", "name username headline profilePicture");
  }

  async updateCode(sessionId, code, language) {
    const update = { code };
    if (language) update.language = language;
    return await CodingSession.findOneAndUpdate({ sessionId }, update, { new: true });
  }

  async addParticipant(sessionId, userId) {
    return await CodingSession.findOneAndUpdate(
      { sessionId },
      { $addToSet: { participants: userId } },
      { new: true }
    );
  }
}

export default new CodeCollabRepository();
