import { connectionRepository } from "./connection.repository.js";
import { userRepository } from "../users/user.repository.js";
import { BadRequestError, NotFoundError } from "../../core/errors/AppError.js";
import { socketGateway } from "../../infrastructure/websocket/socketGateway.js";

export class ConnectionService {
  async sendRequest(senderId, targetUserId) {
    if (senderId.toString() === targetUserId.toString()) {
      throw new BadRequestError("You cannot send a connection request to yourself.");
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError("Target user not found.");
    }

    const existing = await connectionRepository.findExisting(senderId, targetUserId);
    if (existing) {
      throw new BadRequestError("A connection or request already exists between these users.");
    }

    const request = await connectionRepository.create(senderId, targetUserId);

    // Emit live notification through Socket.IO
    socketGateway.emitToUser(targetUserId, "new_notification", {
      type: "CONNECTION_REQUEST",
      senderId,
      message: "You received a new connection request.",
    });

    return request;
  }

  async getMyConnections(userId) {
    return connectionRepository.findUserConnections(userId);
  }

  async respondToRequest(userId, requestId, actionType) {
    const request = await connectionRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Connection request not found.");
    }

    const isAccepted = actionType === "accept" || actionType === true;
    const updated = await connectionRepository.updateStatus(requestId, isAccepted);

    // Notify sender of response
    socketGateway.emitToUser(request.userId, "new_notification", {
      type: isAccepted ? "CONNECTION_ACCEPTED" : "CONNECTION_REJECTED",
      message: isAccepted
        ? "Your connection request was accepted!"
        : "Your connection request was declined.",
    });

    return updated;
  }
}

export const connectionService = new ConnectionService();
