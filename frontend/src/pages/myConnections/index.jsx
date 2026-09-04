import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import {
  acceptConnection,
  getMyConnectionsRequest,
  getConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/userAction";
import { getAboutUser, getAllUsers } from "@/config/redux/action/postAction";
import styles from "./index.module.css";

const DEFAULT_COVER =
  "https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg";

export default function MyConnectionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("DISCOVER"); // "DISCOVER" | "RECEIVED" | "SENT" | "CONNECTIONS"
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingMap, setConnectingMap] = useState({});
  const [dismissedUserIds, setDismissedUserIds] = useState(new Set());

  const handleDismiss = (e, userId) => {
    e.stopPropagation();
    setDismissedUserIds((prev) => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getMyConnectionsRequest(token));
      dispatch(getConnectionsRequest(token));
      dispatch(getAllUsers());
    }
  }, [dispatch]);

  // Determine current user's ID
  const currentUserId = (
    authState.user?.userId?._id ||
    authState.user?.userId ||
    authState.user?._id
  )?.toString();

  const getImageUrl = (imagePath, name = "User") => {
    if (!imagePath) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&bold=true`;
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return imagePath;
  };

  // Process raw connections & requests list
  const rawList = useMemo(() => {
    return [
      ...(Array.isArray(authState.connectionRequests) ? authState.connectionRequests : []),
      ...(Array.isArray(authState.connections) ? authState.connections : []),
    ];
  }, [authState.connectionRequests, authState.connections]);

  // Map other user IDs to connection states
  const { incomingRequests, outgoingRequests, acceptedConnections, connectionStatusMap } =
    useMemo(() => {
      const userMap = new Map();
      const statusMap = new Map();

      rawList.forEach((c) => {
        if (!c || !c.userId || !c.connectionId) return;

        const senderId = (c.userId?._id || c.userId)?.toString();
        const recipientId = (c.connectionId?._id || c.connectionId)?.toString();
        const myId = currentUserId;

        const isSender = senderId === myId;
        const isRecipient = recipientId === myId;

        if (!isSender && !isRecipient) return;

        const otherUser = isSender ? c.connectionId : c.userId;
        const otherId = (otherUser?._id || otherUser)?.toString();

        if (!otherId || otherId === myId) return;

        let status = "SENT";
        if (c.status_accepted === true) {
          status = "CONNECTED";
        } else if (isRecipient) {
          status = "RECEIVED";
        } else {
          status = "SENT";
        }

        statusMap.set(otherId, status);

        const existing = userMap.get(otherId);
        if (
          !existing ||
          status === "CONNECTED" ||
          (status === "RECEIVED" && existing.status !== "CONNECTED")
        ) {
          userMap.set(otherId, {
            request: c,
            status,
            otherUser,
          });
        }
      });

      const incoming = [];
      const outgoing = [];
      const accepted = [];

      userMap.forEach((entry) => {
        if (entry.status === "CONNECTED") {
          accepted.push(entry);
        } else if (entry.status === "RECEIVED") {
          incoming.push(entry);
        } else if (entry.status === "SENT") {
          outgoing.push(entry);
        }
      });

      return {
        incomingRequests: incoming,
        outgoingRequests: outgoing,
        acceptedConnections: accepted,
        connectionStatusMap: statusMap,
      };
    }, [rawList, currentUserId]);

  // Discoverable Users from backend (excluding self)
  const discoverableUsers = useMemo(() => {
    const all = Array.isArray(authState.all_users) ? authState.all_users : [];
    return all
      .filter((u) => {
        const uId = (u?.userId?._id || u?._id || u?.userId)?.toString();
        return uId && uId !== currentUserId && u?.userId?.name;
      })
      .map((u) => {
        const id = (u.userId?._id || u._id).toString();
        const rawBio = u.bio || u.currentPost || u.headline || "";
        const cleanBio =
          rawBio && !rawBio.startsWith("@") && rawBio !== u.userId?.username
            ? rawBio
            : "Software Professional • Open to Opportunities";
        const cover = u.coverPicture || u.bannerUrl || DEFAULT_COVER;

        return {
          id,
          name: u.userId?.name || "Professional",
          username: u.userId?.username || "user",
          bio: cleanBio,
          avatar: u.userId?.profilePicture || "",
          cover,
          mutualName: "Based on your network & skills",
        };
      });
  }, [authState.all_users, currentUserId]);

  // Handle Respond (Accept / Decline)
  const handleRespond = async (e, connectionId, action_type) => {
    e.stopPropagation();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    await dispatch(
      acceptConnection({
        connectionId,
        token,
        action_type,
      })
    );
  };

  // Handle Send Connection Request
  const handleConnect = async (e, targetUserId) => {
    e.stopPropagation();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    setConnectingMap((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      await dispatch(
        sendConnectionRequest({
          token,
          connectionId: targetUserId,
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setConnectingMap((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Filtered lists based on search
  const filteredDiscover = useMemo(() => {
    return discoverableUsers
      .filter((u) => !dismissedUserIds.has(u.id))
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.bio.toLowerCase().includes(q)
        );
      });
  }, [discoverableUsers, searchQuery, dismissedUserIds]);

  const filteredReceived = useMemo(() => {
    if (!searchQuery.trim()) return incomingRequests;
    const q = searchQuery.toLowerCase();
    return incomingRequests.filter(({ otherUser }) => {
      const name = otherUser?.name || otherUser?.userId?.name || "";
      const username = otherUser?.username || otherUser?.userId?.username || "";
      return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
    });
  }, [incomingRequests, searchQuery]);

  const filteredSent = useMemo(() => {
    if (!searchQuery.trim()) return outgoingRequests;
    const q = searchQuery.toLowerCase();
    return outgoingRequests.filter(({ otherUser }) => {
      const name = otherUser?.name || otherUser?.userId?.name || "";
      const username = otherUser?.username || otherUser?.userId?.username || "";
      return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
    });
  }, [outgoingRequests, searchQuery]);

  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return acceptedConnections;
    const q = searchQuery.toLowerCase();
    return acceptedConnections.filter(({ otherUser }) => {
      const name = otherUser?.name || otherUser?.userId?.name || "";
      const username = otherUser?.username || otherUser?.userId?.username || "";
      return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
    });
  }, [acceptedConnections, searchQuery]);

  return (
    <UserLayout>
      <Head>
        <title>Manage My Network & Connections | ProConnect 2.0</title>
        <meta
          name="description"
          content="Grow your professional network, manage connection requests, and discover industry peers on ProConnect."
        />
      </Head>

      <DashBoardLayout>
        <div className={styles.container}>
          {/* ================= 1. HERO BANNER & STATS ================= */}
          <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Professional Network</h1>
              <p className={styles.heroSubtitle}>
                Expand your reach, discover collaborators, and manage your connections.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className={styles.statsRow}>
              <div
                className={`${styles.statCard} ${activeTab === "CONNECTIONS" ? styles.statCardActive : ""}`}
                onClick={() => setActiveTab("CONNECTIONS")}
              >
                <span className={styles.statNumber}>{acceptedConnections.length}</span>
                <span className={styles.statLabel}>Connections</span>
              </div>

              <div
                className={`${styles.statCard} ${activeTab === "RECEIVED" ? styles.statCardActive : ""}`}
                onClick={() => setActiveTab("RECEIVED")}
              >
                <span className={styles.statNumber}>{incomingRequests.length}</span>
                <span className={styles.statLabel}>Invitations</span>
              </div>

              <div
                className={`${styles.statCard} ${activeTab === "SENT" ? styles.statCardActive : ""}`}
                onClick={() => setActiveTab("SENT")}
              >
                <span className={styles.statNumber}>{outgoingRequests.length}</span>
                <span className={styles.statLabel}>Pending Sent</span>
              </div>

              <div
                className={`${styles.statCard} ${activeTab === "DISCOVER" ? styles.statCardActive : ""}`}
                onClick={() => setActiveTab("DISCOVER")}
              >
                <span className={styles.statNumber}>{discoverableUsers.length}</span>
                <span className={styles.statLabel}>Discover People</span>
              </div>
            </div>
          </div>

          {/* ================= 2. NAVIGATION TABS ================= */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabBtn} ${activeTab === "DISCOVER" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("DISCOVER")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
              <span>Discover People</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "RECEIVED" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("RECEIVED")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
              <span>Received Invitations</span>
              {incomingRequests.length > 0 && (
                <span className={styles.tabBadge}>{incomingRequests.length}</span>
              )}
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "SENT" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("SENT")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span>Sent Requests</span>
              {outgoingRequests.length > 0 && (
                <span className={styles.tabBadge}>{outgoingRequests.length}</span>
              )}
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "CONNECTIONS" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("CONNECTIONS")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>My Connections ({acceptedConnections.length})</span>
            </button>
          </div>

          {/* ================= 3. ACTIVE TAB CONTENT ================= */}

          {/* TAB 1: DISCOVER PEOPLE */}
          {activeTab === "DISCOVER" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                    </svg>
                    People You May Want to Connect With
                  </h2>
                  <span className={styles.sectionSubtitle}>
                    Based on your industry, skills, and alumni network
                  </span>
                </div>
              </div>

              {filteredDiscover.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <h3 className={styles.emptyTitle}>No professionals found</h3>
                  <p className={styles.emptySubtitle}>
                    Try searching with another keyword or name.
                  </p>
                </div>
              ) : (
                <div className={styles.peopleGrid}>
                  {filteredDiscover.map((person) => {
                    const status = connectionStatusMap.get(person.id);
                    const isConnecting = connectingMap[person.id];

                    return (
                      <div key={person.id} className={styles.personCard}>
                        {/* Cover Banner */}
                        <div
                          className={styles.cardCover}
                          style={{ backgroundImage: `url(${person.cover})` }}
                        >
                          <button
                            className={styles.dismissBtn}
                            onClick={(e) => handleDismiss(e, person.id)}
                            title="Dismiss recommendation"
                            aria-label="Dismiss"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>

                        {/* Overlapping Avatar */}
                        <div className={styles.avatarWrapper}>
                          <img
                            src={getImageUrl(person.avatar, person.name)}
                            alt={person.name}
                            className={styles.personAvatar}
                            onClick={() => router.push(`/view_profile/${person.username}`)}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=0a66c2&color=fff&bold=true`;
                            }}
                          />
                        </div>

                        {/* Card Content */}
                        <div className={styles.cardContent}>
                          <h3
                            className={styles.personName}
                            onClick={() => router.push(`/view_profile/${person.username}`)}
                            title={person.name}
                          >
                            {person.name}
                          </h3>
                          <p className={styles.personBio}>{person.bio}</p>

                          {/* Mutual Network Indicator */}
                          <div className={styles.mutualRow}>
                            <div className={styles.mutualAvatar}>
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                              </svg>
                            </div>
                            <span className={styles.mutualText}>
                              {person.mutualName}
                            </span>
                          </div>

                          {/* Action Button */}
                          <div className={styles.actionWrapper}>
                            {status === "CONNECTED" ? (
                              <button
                                className={styles.connectedBtn}
                                onClick={() => router.push(`/messages?userId=${person.id}`)}
                              >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Connected</span>
                              </button>
                            ) : status === "SENT" ? (
                              <button className={styles.pendingBtn} disabled>
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>Pending</span>
                              </button>
                            ) : (
                              <button
                                className={styles.connectBtn}
                                onClick={(e) => handleConnect(e, person.id)}
                                disabled={isConnecting}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="8.5" cy="7" r="4" />
                                  <line x1="20" y1="8" x2="20" y2="14" />
                                  <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                                <span>{isConnecting ? "Sending..." : "Connect"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIVED INVITATIONS */}
          {activeTab === "RECEIVED" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                    Pending Invitations ({incomingRequests.length})
                  </h2>
                  <span className={styles.sectionSubtitle}>
                    People who have requested to connect with you
                  </span>
                </div>
              </div>

              {filteredReceived.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3 className={styles.emptyTitle}>You're all caught up!</h3>
                  <p className={styles.emptySubtitle}>
                    No pending invitations at the moment. Discover new people to expand your network.
                  </p>
                  <button
                    className={styles.emptyActionBtn}
                    onClick={() => setActiveTab("DISCOVER")}
                  >
                    Discover People
                  </button>
                </div>
              ) : (
                <div className={styles.requestsList}>
                  {filteredReceived.map(({ request, otherUser }) => {
                    const userObj = otherUser?.userId || otherUser;
                    const name = userObj?.name || "Professional";
                    const username = userObj?.username || "user";
                    const bio = userObj?.bio || `@${username}`;
                    const avatar = userObj?.profilePicture || "";

                    return (
                      <div key={request._id} className={styles.requestCard}>
                        <div
                          className={styles.requestUser}
                          onClick={() => router.push(`/view_profile/${username}`)}
                        >
                          <img
                            src={getImageUrl(avatar, name)}
                            alt={name}
                            className={styles.requestAvatar}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&bold=true`;
                            }}
                          />
                          <div className={styles.requestInfo}>
                            <h4 className={styles.requestName}>{name}</h4>
                            <span className={styles.requestRole}>{bio}</span>
                          </div>
                        </div>

                        <div className={styles.requestActions}>
                          <button
                            className={styles.acceptBtn}
                            onClick={(e) => handleRespond(e, request._id, "accept")}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Accept</span>
                          </button>
                          <button
                            className={styles.declineBtn}
                            onClick={(e) => handleRespond(e, request._id, "reject")}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            <span>Ignore</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SENT REQUESTS */}
          {activeTab === "SENT" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Sent Invitations ({outgoingRequests.length})
                  </h2>
                  <span className={styles.sectionSubtitle}>
                    Connection requests you have sent that are waiting for response
                  </span>
                </div>
              </div>

              {filteredSent.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  <h3 className={styles.emptyTitle}>No pending sent requests</h3>
                  <p className={styles.emptySubtitle}>
                    Start reaching out to professionals to grow your connections.
                  </p>
                  <button
                    className={styles.emptyActionBtn}
                    onClick={() => setActiveTab("DISCOVER")}
                  >
                    Find Professionals
                  </button>
                </div>
              ) : (
                <div className={styles.requestsList}>
                  {filteredSent.map(({ request, otherUser }) => {
                    const userObj = otherUser?.userId || otherUser;
                    const name = userObj?.name || "Professional";
                    const username = userObj?.username || "user";
                    const bio = userObj?.bio || `@${username}`;
                    const avatar = userObj?.profilePicture || "";

                    return (
                      <div key={request._id} className={styles.requestCard}>
                        <div
                          className={styles.requestUser}
                          onClick={() => router.push(`/view_profile/${username}`)}
                        >
                          <img
                            src={getImageUrl(avatar, name)}
                            alt={name}
                            className={styles.requestAvatar}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&bold=true`;
                            }}
                          />
                          <div className={styles.requestInfo}>
                            <h4 className={styles.requestName}>{name}</h4>
                            <span className={styles.requestRole}>{bio}</span>
                          </div>
                        </div>

                        <div className={styles.requestActions}>
                          <span className={styles.pendingBtn}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Request Pending</span>
                          </span>
                          <button
                            className={styles.viewProfileBtn}
                            onClick={() => router.push(`/view_profile/${username}`)}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY CONNECTIONS */}
          {activeTab === "CONNECTIONS" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    My Established Network ({acceptedConnections.length})
                  </h2>
                  <span className={styles.sectionSubtitle}>
                    Professionals you are actively connected with
                  </span>
                </div>
              </div>

              {filteredConnections.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <h3 className={styles.emptyTitle}>No connections yet</h3>
                  <p className={styles.emptySubtitle}>
                    Connect with classmates, colleagues, and industry leaders to see their updates.
                  </p>
                  <button
                    className={styles.emptyActionBtn}
                    onClick={() => setActiveTab("DISCOVER")}
                  >
                    Discover People
                  </button>
                </div>
              ) : (
                <div className={styles.requestsList}>
                  {filteredConnections.map(({ otherUser, request }) => {
                    const userObj = otherUser?.userId || otherUser;
                    const name = userObj?.name || "Connection";
                    const username = userObj?.username || "user";
                    const bio = userObj?.bio || `@${username}`;
                    const avatar = userObj?.profilePicture || "";
                    const otherUserId = (userObj?._id || userObj?.id || "")?.toString();

                    return (
                      <div key={request?._id || username} className={styles.requestCard}>
                        <div
                          className={styles.requestUser}
                          onClick={() => router.push(`/view_profile/${username}`)}
                        >
                          <img
                            src={getImageUrl(avatar, name)}
                            alt={name}
                            className={styles.requestAvatar}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&bold=true`;
                            }}
                          />
                          <div className={styles.requestInfo}>
                            <h4 className={styles.requestName}>{name}</h4>
                            <span className={styles.requestRole}>{bio}</span>
                          </div>
                        </div>

                        <div className={styles.requestActions}>
                          <button
                            className={styles.messageBtn}
                            onClick={() => router.push(otherUserId ? `/messages?userId=${otherUserId}` : "/messages")}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Message</span>
                          </button>
                          <button
                            className={styles.viewProfileBtn}
                            onClick={() => router.push(`/view_profile/${username}`)}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
