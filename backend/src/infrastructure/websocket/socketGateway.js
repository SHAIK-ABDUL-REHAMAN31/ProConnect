import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";

import User from "../../modules/users/user.model.js";

class SocketGateway {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map(); // userId -> Set of socketIds
  }

  initialize(httpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (
            origin.includes("localhost") ||
            origin.endsWith(".vercel.app") ||
            origin === ENV.FRONTEND_URL ||
            origin === "https://pro-connect-eta.vercel.app"
          ) {
            return callback(null, true);
          }
          return callback(null, true); // Allow connection
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next();
      }

      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        socket.userId = decoded.id;
      } catch {
        // Fallback: Verify legacy hex token in database
        try {
          const user = await User.findOne({ token }).select("_id");
          if (user) {
            socket.userId = user._id.toString();
          }
        } catch {
          socket.userId = null;
        }
      }
      next();
    });

    this.io.on("connection", (socket) => {
      const userId = socket.userId;
      console.log(`[WebSocket] Client connected: ${socket.id} (User: ${userId || "Anonymous"})`);

      if (userId) {
        if (!this.onlineUsers.has(userId)) {
          this.onlineUsers.set(userId, new Set());
        }
        this.onlineUsers.get(userId).add(socket.id);
        socket.join(`user:${userId}`);

        // Broadcast presence update
        this.io.emit("user_status", { userId, status: "ONLINE" });
      }

      // Join a conversation room
      socket.on("join_conversation", (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined conversation: ${conversationId}`);
      });

      // Join a community / group room
      socket.on("join_community", (communityId) => {
        socket.join(`community:${communityId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined community: ${communityId}`);
      });

      socket.on("leave_community", (communityId) => {
        socket.leave(`community:${communityId}`);
        console.log(`[WebSocket] Socket ${socket.id} left community: ${communityId}`);
      });

      // Typing indicators
      socket.on("typing_start", ({ conversationId, senderId, senderName }) => {
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          conversationId,
          userId: senderId,
          userName: senderName,
          isTyping: true,
        });
      });

      socket.on("typing_stop", ({ conversationId, senderId }) => {
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          conversationId,
          userId: senderId,
          isTyping: false,
        });
      });

      // Disconnect handling
      socket.on("disconnect", () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        if (userId && this.onlineUsers.has(userId)) {
          const userSockets = this.onlineUsers.get(userId);
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.onlineUsers.delete(userId);
            this.io.emit("user_status", { userId, status: "OFFLINE" });
          }
        }
      });
    });

    console.log("[WebSocket] Gateway successfully initialized.");
    return this.io;
  }

  emitToUser(userId, event, payload) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, payload);
    }
  }

  emitToConversation(conversationId, event, payload) {
    if (this.io) {
      this.io.to(`conversation:${conversationId}`).emit(event, payload);
    }
  }

  emitToCommunity(communityId, event, payload) {
    if (this.io) {
      this.io.to(`community:${communityId}`).emit(event, payload);
    }
  }

  isUserOnline(userId) {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId).size > 0;
  }
}

export const socketGateway = new SocketGateway();

