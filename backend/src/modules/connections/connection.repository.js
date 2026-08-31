import Connection from "./connection.model.js";

export class ConnectionRepository {
  async findExisting(userId, connectionId) {
    return Connection.findOne({
      $or: [
        { userId, connectionId },
        { userId: connectionId, connectionId: userId },
      ],
    }).exec();
  }

  async findById(id) {
    return Connection.findById(id).exec();
  }

  async create(userId, connectionId) {
    const connection = new Connection({
      userId,
      connectionId,
      status: "PENDING",
      status_accepted: null,
    });
    return connection.save();
  }

  async findUserConnections(userId) {
    return Connection.find({
      $or: [{ userId }, { connectionId: userId }],
    })
      .populate("userId", "name username email profilePicture headline")
      .populate("connectionId", "name username email profilePicture headline")
      .sort({ updatedAt: -1 })
      .exec();
  }

  async updateStatus(id, isAccepted) {
    return Connection.findByIdAndUpdate(
      id,
      {
        $set: {
          status: isAccepted ? "ACCEPTED" : "REJECTED",
          status_accepted: isAccepted,
        },
      },
      { new: true }
    ).exec();
  }
}

export const connectionRepository = new ConnectionRepository();
