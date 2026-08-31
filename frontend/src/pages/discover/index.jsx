import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser, getAllUsers } from "@/config/redux/action/postAction";
import {
  sendConnectionRequest,
  getMyConnectionsRequest,
  getConnectionsRequest,
} from "@/config/redux/action/userAction";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import Head from "next/head";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getMyConnectionsRequest(token));
      dispatch(getConnectionsRequest(token));
    }
  }, []);

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://ui-avatars.com/api/?name=User&size=150&background=0D8ABC&color=fff";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";
  };

  const currentUserId =
    authState?.user?.userId?._id ||
    authState?.user?.userId ||
    authState?.user?._id;

  const rawConnections = [
    ...(Array.isArray(authState.connectionRequests) ? authState.connectionRequests : []),
    ...(Array.isArray(authState.connections) ? authState.connections : []),
  ];

  const getConnectionStatus = (targetUserId) => {
    const tId = targetUserId?.toString();
    const match = rawConnections.find((c) => {
      const uId = (c.userId?._id || c.userId)?.toString();
      const cId = (c.connectionId?._id || c.connectionId)?.toString();
      return uId === tId || cId === tId;
    });

    if (!match) return "NONE";
    return match.status_accepted === true ? "CONNECTED" : "PENDING";
  };

  const handleConnect = async (e, targetUserId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    await dispatch(sendConnectionRequest({ token, connectionId: targetUserId }));
  };

  const filteredUsers = authState.all_profiles_fetched
    ? authState.all_users
      .filter((profiles) => {
        const profileUserId = profiles.userId?._id || profiles.userId;
        return profileUserId?.toString() !== currentUserId?.toString();
      })
      .filter((profiles) => {
        if (!searchQuery.trim()) return true;
        return (
          profiles.userId?.username
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          profiles.userId?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      })
    : [];

  return (
    <UserLayout>
      <Head>
        <title>Discover People & Connect | ProConnect 2.0</title>
      </Head>
      <DashBoardLayout>
        <div className={styles.discoverContainer}>
          <div className={styles.header}>
            <h1>Discover People</h1>
            <p>Connect with industry leaders, peers, and collaborators in your network</p>

            <div className={styles.searchContainer}>
              <div className={styles.searchBox}>
                <svg
                  className={styles.searchIcon}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    className={styles.clearBtn}
                    onClick={() => setSearchQuery("")}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4l8 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((profiles) => {
                const targetId = profiles.userId?._id || profiles.userId;
                const connectionStatus = getConnectionStatus(targetId);

                return (
                  <div
                    key={profiles._id}
                    className={styles.profileCard}
                    onClick={() => {
                      router.push(`/view_profile/${profiles.userId?.username}`);
                    }}
                  >
                    <div
                      className={styles.cardHeader}
                      style={{
                        backgroundImage: `url(${profiles.coverPicture || profiles.bannerUrl || "https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className={styles.coverBg} style={{ background: "rgba(0,0,0,0.15)" }}></div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.avatarContainer}>
                        <img
                          className={styles.avatar}
                          src={getImageUrl(profiles.userId?.profilePicture)}
                          alt={profiles.userId?.username || "User"}
                        />
                      </div>

                      <div className={styles.userInfo}>
                        <h2 className={styles.userName}>
                          {profiles.userId?.name || profiles.userId?.username}
                        </h2>
                        <p className={styles.userEmail}>
                          @{profiles.userId?.username}
                        </p>
                        <div className={styles.bio}>
                          {profiles.bio ||
                            profiles.currentPost ||
                            "Professional on ProConnect."}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                        {connectionStatus === "CONNECTED" ? (
                          <button
                            className={styles.connectBtn}
                            style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/messages?userId=${targetId}`);
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Connected</span>
                          </button>
                        ) : connectionStatus === "PENDING" ? (
                          <button
                            className={styles.connectBtn}
                            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                            disabled
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Pending</span>
                          </button>
                        ) : (
                          <button
                            className={styles.connectBtn}
                            onClick={(e) => handleConnect(e, targetId)}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noResults}>No users found.</p>
            )}
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
