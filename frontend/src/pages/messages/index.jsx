import React, { useState, useEffect, useRef, useMemo } from "react";
import UserLayout from "@/layout/UserLayout";
import styles from "./messages.module.css";
import { api } from "@/services/apiClient";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser } from "@/config/redux/action/postAction";
import { getMyConnectionsRequest, getConnectionsRequest } from "@/config/redux/action/userAction";
import Head from "next/head";

export default function MessagesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [activeTab, setActiveTab] = useState("CHATS"); // "CHATS" | "CONNECTIONS"
  const [searchQuery, setSearchQuery] = useState("");
  const [startingChat, setStartingChat] = useState({});
  const { socket, onlineUsers } = useSocket();
  const messagesEndRef = useRef(null);

  // Load user profile & connections on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      if (!authState.profileFetched) {
        dispatch(getAboutUser({ token }));
      }
      dispatch(getMyConnectionsRequest(token));
      dispatch(getConnectionsRequest(token));
    }
  }, [dispatch]);

  // Determine current user ID
  let currentUserId =
    authState.user?.userId?._id ||
    authState.user?.userId?.id ||
    authState.user?.userId ||
    authState.user?._id;

  if (!currentUserId && typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      currentUserId = stored._id || stored.id;
    } catch (e) {}
  }

  const getImageUrl = (imagePath, name = "User") => {
    if (
      !imagePath ||
      imagePath === "default.jpg" ||
      imagePath === "undefined" ||
      imagePath === "null"
    ) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&size=150&background=0a66c2&color=fff&bold=true`;
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/")) {
      return imagePath;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&size=150&background=0a66c2&color=fff&bold=true`;
  };

  // Extract accepted connections list from Redux
  const connectedUsers = useMemo(() => {
    const rawList = [
      ...(Array.isArray(authState.connectionRequests) ? authState.connectionRequests : []),
      ...(Array.isArray(authState.connections) ? authState.connections : []),
    ];

    const myId = currentUserId?.toString();
    const userMap = new Map();

    rawList.forEach((c) => {
      if (!c || c.status_accepted !== true) return;
      const senderId = (c.userId?._id || c.userId)?.toString();
      const recipientId = (c.connectionId?._id || c.connectionId)?.toString();

      const isSender = senderId === myId;
      const isRecipient = recipientId === myId;

      if (!isSender && !isRecipient) return;

      const other = isSender ? c.connectionId : c.userId;
      const otherObj = other?.userId || other;
      const otherId = (otherObj?._id || otherObj?.id || other?._id || other)?.toString();

      if (otherId && otherId !== myId && !userMap.has(otherId)) {
        userMap.set(otherId, {
          id: otherId,
          name: otherObj?.name || "Connection",
          username: otherObj?.username || "user",
          bio: otherObj?.bio || otherObj?.headline || otherObj?.currentPost || "Connected Member",
          profilePicture: otherObj?.profilePicture || "",
        });
      }
    });

    return Array.from(userMap.values());
  }, [authState.connectionRequests, authState.connections, currentUserId]);

  const fetchConversations = async () => {
    try {
      const res = await api.getConversations();
      const list = res.data.data?.conversations || [];
      setConversations(list);

      const targetUserId = router.query.userId;
      if (targetUserId) {
        let match = list.find((c) =>
          c.participants?.some(
            (p) => (p._id || p.id)?.toString() === targetUserId.toString()
          )
        );
        if (!match) {
          try {
            const startRes = await api.startConversation(targetUserId);
            match = startRes.data.data?.conversation;
            if (match) {
              list.unshift(match);
              setConversations([...list]);
            }
          } catch (e) {
            console.error("Could not start conversation with user:", e);
          }
        }
        if (match) {
          selectConversation(match);
          return;
        }
      }

      if (list.length > 0 && !activeConversation) {
        selectConversation(list[0]);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    if (socket) {
      socket.emit("join_conversation", conv._id);
    }
    try {
      const res = await api.getMessages(conv._id);
      setMessages(res.data.data?.messages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // Start or switch to a conversation with a connected user
  const handleStartChatWithUser = async (targetUserId) => {
    if (!targetUserId) return;
    setStartingChat((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      let match = conversations.find((c) =>
        c.participants?.some(
          (p) => (p._id || p.id)?.toString() === targetUserId.toString()
        )
      );

      if (!match) {
        const startRes = await api.startConversation(targetUserId);
        match = startRes.data.data?.conversation;
        if (match) {
          setConversations((prev) => [match, ...prev]);
        }
      }

      if (match) {
        selectConversation(match);
        setActiveTab("CHATS");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    } finally {
      setStartingChat((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [router.query.userId]);

  // Listen for realtime messages and typing events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    const handleUserTyping = ({
      conversationId,
      userName,
      isTyping: typingStatus,
    }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setIsTyping(typingStatus);
        setTypingUser(userName);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const text = newMessage;
      setNewMessage("");
      if (socket) {
        socket.emit("typing_stop", {
          conversationId: activeConversation._id,
          senderId: currentUserId,
        });
      }

      const res = await api.sendMessage({
        conversationId: activeConversation._id,
        content: text,
      });

      // Optimistically add message if not already added by socket
      if (res.data.data?.message) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === res.data.data.message._id);
          return exists ? prev : [...prev, res.data.data.message];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);
    if (socket && activeConversation) {
      socket.emit("typing_start", {
        conversationId: activeConversation._id,
        senderId: currentUserId,
        senderName:
          authState.user?.userId?.name || authState.user?.name || "A connection",
      });
    }
  };

  const getRecipient = (conv) => {
    if (!conv || !conv.participants) return {};
    const myId = currentUserId?.toString();
    return (
      conv.participants.find(
        (p) => (p._id || p.id)?.toString() !== myId
      ) ||
      conv.participants[0] ||
      {}
    );
  };

  // Filtered conversations & connections
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const recipient = getRecipient(conv);
      const name = recipient?.name || recipient?.username || "";
      return name.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connectedUsers;
    const q = searchQuery.toLowerCase();
    return connectedUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q)
      );
    });
  }, [connectedUsers, searchQuery]);

  return (
    <UserLayout>
      <Head>
        <title>Messages & Real-time Chat | ProConnect 2.0</title>
        <meta
          name="description"
          content="Chat with your professional connections in real-time on ProConnect."
        />
      </Head>
      <div className={styles.container}>
        <div className={styles.chatLayout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.headerTitleRow}>
                <h2>Messaging</h2>
                <button
                  className={styles.newChatBtn}
                  onClick={() => setActiveTab(activeTab === "CHATS" ? "CONNECTIONS" : "CHATS")}
                  title={activeTab === "CHATS" ? "New message to connection" : "View chat history"}
                >
                  {activeTab === "CHATS" ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  )}
                </button>
              </div>

              {/* Sidebar Tabs */}
              <div className={styles.sidebarTabs}>
                <button
                  className={`${styles.sidebarTabBtn} ${activeTab === "CHATS" ? styles.sidebarTabActive : ""}`}
                  onClick={() => setActiveTab("CHATS")}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Chats ({conversations.length})</span>
                </button>

                <button
                  className={`${styles.sidebarTabBtn} ${activeTab === "CONNECTIONS" ? styles.sidebarTabActive : ""}`}
                  onClick={() => setActiveTab("CONNECTIONS")}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <span>Connections ({connectedUsers.length})</span>
                </button>
              </div>

              {/* Search */}
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder={activeTab === "CHATS" ? "Search conversations..." : "Search connections..."}
                  className={styles.sidebarSearchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className={styles.clearSearchBtn} onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tab 1: Conversations List */}
            {activeTab === "CHATS" && (
              <div className={styles.conversationList}>
                {filteredConversations.length === 0 ? (
                  <div className={styles.emptySidebar}>
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p className={styles.emptySidebarTitle}>No active conversations</p>
                    <p className={styles.emptySidebarSub}>
                      Select a connection to start messaging right away.
                    </p>
                    {connectedUsers.length > 0 && (
                      <button
                        className={styles.switchTabActionBtn}
                        onClick={() => setActiveTab("CONNECTIONS")}
                      >
                        View {connectedUsers.length} Connections
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const otherUser = getRecipient(conv);
                    const otherUserId = (otherUser._id || otherUser.id)?.toString();
                    const isOnline = onlineUsers.has(otherUserId);
                    return (
                      <div
                        key={conv._id}
                        className={`${styles.conversationItem} ${
                          activeConversation?._id === conv._id ? styles.active : ""
                        }`}
                        onClick={() => selectConversation(conv)}
                      >
                        <div className={styles.avatarWrap}>
                          <img
                            src={getImageUrl(
                              otherUser.profilePicture,
                              otherUser.name || otherUser.username
                            )}
                            alt={otherUser.name || "User"}
                            className={styles.avatar}
                          />
                          {isOnline && <span className={styles.onlineDot}></span>}
                        </div>
                        <div className={styles.convDetails}>
                          <div className={styles.convName}>
                            {otherUser.name || otherUser.username || "User"}
                          </div>
                          <div className={styles.lastMsg}>
                            {conv.lastMessage?.content || "Start a conversation..."}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Connections List */}
            {activeTab === "CONNECTIONS" && (
              <div className={styles.conversationList}>
                {filteredConnections.length === 0 ? (
                  <div className={styles.emptySidebar}>
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <p className={styles.emptySidebarTitle}>No connections found</p>
                    <p className={styles.emptySidebarSub}>
                      Connect with peers in your network to start sending messages.
                    </p>
                    <button
                      className={styles.switchTabActionBtn}
                      onClick={() => router.push("/myConnections")}
                    >
                      Grow Network
                    </button>
                  </div>
                ) : (
                  filteredConnections.map((user) => {
                    const isOnline = onlineUsers.has(user.id);
                    const isBusy = startingChat[user.id];
                    return (
                      <div
                        key={user.id}
                        className={styles.connectionItem}
                        onClick={() => handleStartChatWithUser(user.id)}
                      >
                        <div className={styles.avatarWrap}>
                          <img
                            src={getImageUrl(user.profilePicture, user.name)}
                            alt={user.name}
                            className={styles.avatar}
                          />
                          {isOnline && <span className={styles.onlineDot}></span>}
                        </div>
                        <div className={styles.convDetails}>
                          <div className={styles.convName}>{user.name}</div>
                          <div className={styles.connectionRole}>{user.bio}</div>
                        </div>
                        <button
                          className={styles.chatActionBtn}
                          disabled={isBusy}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChatWithUser(user.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span>{isBusy ? "Opening..." : "Chat"}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Active Chat Area */}
          <div className={styles.chatArea}>
            {activeConversation ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.avatarWrap}>
                    <img
                      src={getImageUrl(
                        getRecipient(activeConversation).profilePicture,
                        getRecipient(activeConversation).name ||
                          getRecipient(activeConversation).username
                      )}
                      alt="User"
                      className={styles.avatar}
                      onClick={() => {
                        const uname = getRecipient(activeConversation).username;
                        if (uname) router.push(`/view_profile/${uname}`);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                    {onlineUsers.has(
                      (
                        getRecipient(activeConversation)._id ||
                        getRecipient(activeConversation).id
                      )?.toString()
                    ) && <span className={styles.onlineDot}></span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      onClick={() => {
                        const uname = getRecipient(activeConversation).username;
                        if (uname) router.push(`/view_profile/${uname}`);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {getRecipient(activeConversation).name ||
                        getRecipient(activeConversation).username}
                    </h3>
                    <span className={styles.statusIndicator}>
                      {onlineUsers.has(
                        (
                          getRecipient(activeConversation)._id ||
                          getRecipient(activeConversation).id
                        )?.toString()
                      ) ? (
                        <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></span>
                          Active Now
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>Offline</span>
                      )}
                    </span>
                  </div>

                  <button
                    className={styles.viewProfileHeaderBtn}
                    onClick={() => {
                      const uname = getRecipient(activeConversation).username;
                      if (uname) router.push(`/view_profile/${uname}`);
                    }}
                  >
                    View Profile
                  </button>
                </div>

                <div className={styles.messagesList}>
                  {messages.length === 0 ? (
                    <div className={styles.emptyMessagesList}>
                      <p>No messages yet. Send a greeting to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const senderId = (
                        msg.senderId?._id ||
                        msg.senderId?.id ||
                        msg.senderId
                      )?.toString();
                      const isMyMsg = senderId === currentUserId?.toString();

                      return (
                        <div
                          key={msg._id || index}
                          className={`${styles.messageBubble} ${
                            isMyMsg ? styles.sent : styles.received
                          }`}
                        >
                          <div>{msg.content}</div>
                          <div className={styles.messageTime}>
                            {new Date(
                              msg.createdAt || Date.now()
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {isTyping && (
                  <div className={styles.typingIndicator}>
                    {typingUser || "Someone"} is typing...
                  </div>
                )}

                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className={styles.messageInput}
                    value={newMessage}
                    onChange={handleTypingInput}
                  />
                  <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.emptyChatContainer}>
                <div className={styles.emptyChatContent}>
                  <div className={styles.emptyChatIconCircle}>
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#0a66c2" strokeWidth="1.8">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3>Select a conversation to start messaging</h3>
                  <p>Choose from your active conversations or start a new chat with one of your connections.</p>

                  {connectedUsers.length > 0 && (
                    <div className={styles.quickConnectionsSection}>
                      <h4>Your Connections ({connectedUsers.length})</h4>
                      <div className={styles.quickConnectionsGrid}>
                        {connectedUsers.slice(0, 6).map((u) => (
                          <div
                            key={u.id}
                            className={styles.quickConnectionCard}
                            onClick={() => handleStartChatWithUser(u.id)}
                          >
                            <img
                              src={getImageUrl(u.profilePicture, u.name)}
                              alt={u.name}
                              className={styles.quickAvatar}
                            />
                            <div className={styles.quickInfo}>
                              <strong>{u.name}</strong>
                              <span>@{u.username}</span>
                            </div>
                            <button className={styles.quickChatBtn}>
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                              Chat
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
