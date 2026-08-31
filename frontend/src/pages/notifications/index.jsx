import React, { useState, useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import styles from "./notifications.module.css";
import { api } from "@/services/apiClient";
import { useSocket } from "@/context/SocketContext";
import Head from "next/head";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      _id: "demo_1",
      message: "Sarah Jenkins sent you a connection request.",
      type: "CONNECTION_REQUEST",
      isRead: false,
      createdAt: new Date().toISOString(),
      senderId: {
        name: "Sarah Jenkins",
        profilePicture: "/images/landingImage.jpg",
      },
    },
    {
      _id: "demo_2",
      message: "Your application for Senior Full Stack Engineer has been updated to SCREENING.",
      type: "APPLICATION_UPDATE",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      senderId: {
        name: "TechCorp Recruiting",
        profilePicture: "/images/illustration.png",
      },
    },
  ]);

  const { notifications: liveNotifications } = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res.data.data?.notifications?.length > 0) {
          setNotifications(res.data.data.notifications);
        }
      } catch (err) {
        console.log("Using live and local notifications list");
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
    } catch (e) {}
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const allNotifications = [...liveNotifications, ...notifications];

  return (
    <UserLayout>
      <Head>
        <title>Notifications Center | ProConnect 2.0</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Notifications</h1>
          </div>
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
            ✓ Mark all as read
          </button>
        </div>

        <div className={styles.notificationList}>
          {allNotifications.map((n, idx) => (
            <div
              key={n._id || idx}
              className={`${styles.notificationCard} ${!n.isRead ? styles.unread : ""}`}
              onClick={() => handleMarkRead(n._id)}
            >
              <img
                src={n.senderId?.profilePicture || "/images/landingImage.jpg"}
                alt={n.senderId?.name || "User"}
                className={styles.avatar}
              />
              <div className={styles.content}>
                <p className={styles.message}>{n.message}</p>
                <span className={styles.time}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {!n.isRead && <div className={styles.unreadDot} />}
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
