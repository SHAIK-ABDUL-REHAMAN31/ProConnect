import { connectionService } from "./connection.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class ConnectionController {
  async sendRequest(req, res, next) {
    try {
      const { connectionId } = req.body;
      const request = await connectionService.sendRequest(req.user._id, connectionId);
      return ApiResponse.created(res, { request }, "Connection request sent successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getMyConnections(req, res, next) {
    try {
      const connections = await connectionService.getMyConnections(req.user._id);
      return ApiResponse.success(res, { connections }, "User connections retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async respondToRequest(req, res, next) {
    try {
      const { requestId, action_type } = req.body;
      const updated = await connectionService.respondToRequest(
        req.user._id,
        requestId,
        action_type
      );
      return ApiResponse.success(res, { connection: updated }, "Connection response processed.");
    } catch (error) {
      next(error);
    }
  }
}

export const connectionController = new ConnectionController();
