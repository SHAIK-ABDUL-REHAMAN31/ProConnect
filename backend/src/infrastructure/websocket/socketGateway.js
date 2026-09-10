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
    const allowedOrigins = [
      "http://localhost:3000",
      "https://linkedin-clone-frontend-psi.vercel.app",
      "https://pro-connect-eta.vercel.app",
      "https://proconnect-1-8mwt.onrender.com",
      ENV.FRONTEND_URL,
    ].filter(Boolean);

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error("Origin not allowed by WebSocket CORS"));
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

      // Join a conversation room with strict membership check
      socket.on("join_conversation", async (conversationId) => {
        if (!socket.userId) {
          socket.emit("error", { message: "Authentication required to join conversation rooms." });
          return;
        }

        try {
          const Conversation = (await import("../../modules/messaging/conversation.model.js")).default;
          const conversation = await Conversation.findById(conversationId);
          if (
            !conversation ||
            !conversation.participants.some((p) => p.toString() === socket.userId.toString())
          ) {
            socket.emit("error", { message: "Not authorized to join this conversation." });
            return;
          }

          socket.join(`conversation:${conversationId}`);
          console.log(`[WebSocket] Authorized socket ${socket.id} (User ${socket.userId}) joined conversation: ${conversationId}`);
        } catch (err) {
          console.error("[WebSocket] Join conversation error:", err.message);
        }
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

      // Secure typing indicators tied to authenticated session
      socket.on("typing_start", async ({ conversationId, senderName }) => {
        if (!socket.userId) return;
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          conversationId,
          userId: socket.userId,
          userName: senderName || "Someone",
          isTyping: true,
        });
      });

      socket.on("typing_stop", ({ conversationId }) => {
        if (!socket.userId) return;
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          conversationId,
          userId: socket.userId,
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

