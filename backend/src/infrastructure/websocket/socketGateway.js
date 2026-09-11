import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import logger from "../logger/logger.js";

import User from "../../modules/users/user.model.js";

class SocketGateway {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map(); // userId -> Set of socketIds
    this.codeRooms = new Map(); // roomId -> Map(socketId -> userInfo)
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
      logger.info(`WebSocket client connected`, { socketId: socket.id, userId: userId || "Anonymous" });

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
          logger.info(`WebSocket authorized join conversation`, { socketId: socket.id, userId: socket.userId, conversationId });
        } catch (err) {
          logger.error("WebSocket join conversation error", { error: err.message });
        }
      });

      // Join a community / group room
      socket.on("join_community", (communityId) => {
        socket.join(`community:${communityId}`);
        logger.debug(`WebSocket joined community`, { socketId: socket.id, communityId });
      });

      socket.on("leave_community", (communityId) => {
        socket.leave(`community:${communityId}`);
        logger.debug(`WebSocket left community`, { socketId: socket.id, communityId });
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

      // ─── Real-Time Code Collab Events ───
      socket.on("join_code_room", ({ roomId, user }) => {
        if (!roomId) return;
        socket.join(`code_room:${roomId}`);

        if (!this.codeRooms.has(roomId)) {
          this.codeRooms.set(roomId, {
            users: new Map(),
            code: null,
            language: null,
            problemId: null,
          });
        }
        const roomData = this.codeRooms.get(roomId);
        const role = roomData.users.size === 0 ? "Host" : "Candidate";
        const peerName = user?.name || (role === "Host" ? "Interviewer" : `Peer #${roomData.users.size + 1}`);

        roomData.users.set(socket.id, {
          socketId: socket.id,
          userId: socket.userId || null,
          name: peerName,
          avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(peerName)}&background=0a66c2&color=fff`,
          role,
          joinedAt: new Date().toISOString(),
        });

        const participants = Array.from(roomData.users.values());
        this.io.to(`code_room:${roomId}`).emit("code_room_users", {
          roomId,
          participants,
        });

        // Send existing code buffer to newly joined peer
        if (roomData.code) {
          socket.emit("code_init_state", {
            roomId,
            code: roomData.code,
            language: roomData.language,
            problemId: roomData.problemId,
          });
        }

        logger.info(`WebSocket joined code room`, { socketId: socket.id, peerName, roomId, totalParticipants: participants.length });
      });

      socket.on("code_change", ({ roomId, code, language, problemId, cursor }) => {
        if (!roomId) return;
        if (this.codeRooms.has(roomId)) {
          const roomData = this.codeRooms.get(roomId);
          roomData.code = code;
          if (language) roomData.language = language;
          if (problemId) roomData.problemId = problemId;
        }

        socket.to(`code_room:${roomId}`).emit("code_updated", {
          roomId,
          code,
          language,
          problemId,
          cursor,
          senderId: socket.id,
        });
      });

      socket.on("code_run", ({ roomId, language }) => {
        if (!roomId) return;
        socket.to(`code_room:${roomId}`).emit("code_executing", {
          roomId,
          language,
          senderId: socket.id,
        });
      });

      socket.on("code_result", ({ roomId, results, allPassed, language, duration }) => {
        if (!roomId) return;
        socket.to(`code_room:${roomId}`).emit("code_result_received", {
          roomId,
          results,
          allPassed,
          language,
          duration,
          senderId: socket.id,
        });
      });

      socket.on("code_chat_message", ({ roomId, text, user }) => {
        if (!roomId || !text) return;
        const msg = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          text: String(text).slice(0, 500),
          senderName: user?.name || "Peer",
          senderAvatar: user?.avatar || "",
          senderId: socket.id,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        this.io.to(`code_room:${roomId}`).emit("code_chat_received", msg);
      });

      socket.on("leave_code_room", ({ roomId }) => {
        if (!roomId || !this.codeRooms.has(roomId)) return;
        socket.leave(`code_room:${roomId}`);
        const roomData = this.codeRooms.get(roomId);
        roomData.users.delete(socket.id);
        if (roomData.users.size === 0) {
          this.codeRooms.delete(roomId);
        } else {
          this.io.to(`code_room:${roomId}`).emit("code_room_users", {
            roomId,
            participants: Array.from(roomData.users.values()),
          });
        }
      });

      // Disconnect handling
      socket.on("disconnect", () => {
        logger.info(`WebSocket client disconnected`, { socketId: socket.id });
        if (userId && this.onlineUsers.has(userId)) {
          const userSockets = this.onlineUsers.get(userId);
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.onlineUsers.delete(userId);
            this.io.emit("user_status", { userId, status: "OFFLINE" });
          }
        }

        // Clean up from all code rooms
        for (const [roomId, roomData] of this.codeRooms.entries()) {
          if (roomData.users && roomData.users.has(socket.id)) {
            roomData.users.delete(socket.id);
            if (roomData.users.size === 0) {
              this.codeRooms.delete(roomId);
            } else {
              this.io.to(`code_room:${roomId}`).emit("code_room_users", {
                roomId,
                participants: Array.from(roomData.users.values()),
              });
            }
          }
        }
      });
    });

    logger.info("WebSocket Gateway successfully initialized");
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

