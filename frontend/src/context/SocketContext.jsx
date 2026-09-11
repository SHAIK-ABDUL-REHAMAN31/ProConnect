import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../services/apiClient";

export const SocketContext = createContext({
  socket: null,
  onlineUsers: new Set(),
  unreadCount: 0,
  notifications: [],
});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL || "http://localhost:3030";

    const newSocket = io(socketUrl, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
    });

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected to ProConnect realtime gateway");
    });

    newSocket.on("user_status", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "ONLINE") next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    newSocket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notifications,
        unreadCount: notifications.length,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
