import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "./communityDetail.module.css";
import { api } from "@/services/apiClient";
import { useSocket } from "@/context/SocketContext";

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
];

const CATEGORIES = [
  "Frontend",
  "Backend",
  "AI & ML",
  "DevOps & Cloud",
  "Mobile",
  "Career & Startups",
  "General",
];

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { socket } = useSocket();

  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Top Action Modals (About, Rules, Members)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Chat Input State
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { _id, content, senderId }
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editIcon, setEditIcon] = useState("🚀");
  const [editBanner, setEditBanner] = useState(PRESET_BANNERS[0]);
  const [editRules, setEditRules] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Member search in modal
  const [modSearch, setModSearch] = useState("");

  // Load Current User
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error reading current user:", e);
      }
    }
  }, []);

  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch Community Details & Messages
  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getCommunityById(id);
      if (res.data?.data?.community) {
        const c = res.data.data.community;
        setCommunity(c);
        setEditName(c.name || "");
        setEditDesc(c.description || "");
        setEditCategory(c.category || "General");
        setEditIcon(c.icon || "🚀");
        setEditBanner(c.banner || PRESET_BANNERS[0]);
        setEditRules(Array.isArray(c.rules) ? c.rules.join("\n") : c.rules || "");
        setEditIsPrivate(Boolean(c.isPrivate));
      }
    } catch (err) {
      console.log("Using cached community details:", err.message);
      setCommunity((prev) => {
        if (prev) return prev;
        return {
          _id: id,
          name: "Distributed Systems & Cloud Architecture",
          category: "DevOps & Cloud",
          description:
            "Deep dive discussions into microservices resilience, consensus algorithms (Raft/Paxos), event streaming with Apache Kafka, and multi-region Kubernetes deployments.",
          icon: "☁️",
          banner: PRESET_BANNERS[0],
          creatorId: { _id: "owner_1", name: "Alex Mercer", username: "alexm" },
          moderators: [{ _id: "mod_1", name: "Elena Rostova", username: "elena_r" }],
          members: [
            { _id: "owner_1", name: "Alex Mercer", username: "alexm" },
            { _id: "mod_1", name: "Elena Rostova", username: "elena_r" },
            { _id: "user_3", name: "David Kim", username: "dkim" },
          ],
          rules: [
            "Be respectful and encourage constructive technical debate.",
            "Provide reproducible examples and architectural diagrams where possible.",
            "Strictly zero unsolicited recruiter messages or spam.",
          ],
          isPrivate: false,
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const res = await api.getCommunityMessages(id);
      if (res.data?.data?.messages) {
        setMessages(res.data.data.messages);
      }
    } catch (e) {
      console.log("Using initial discussion messages");
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            _id: "msg_1",
            senderId: {
              _id: "owner_1",
              name: "Alex Mercer",
              username: "alexm",
              headline: "Principal Cloud Architect @ AWS",
              profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            },
            content:
              "Welcome to the Distributed Systems hub! Let's kick off this week's discussion: How are you managing schema registry evolution across decoupled Kafka event consumers?",
            mediaUrl: "",
            upvotes: ["u1", "u2", "u3"],
            downvotes: [],
            replyTo: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            _id: "msg_2",
            senderId: {
              _id: "mod_1",
              name: "Elena Rostova",
              username: "elena_r",
              headline: "Staff Infrastructure Engineer",
              profilePicture: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            },
            content:
              "We enforce Protobuf with forward compatibility checks in CI pipelines before deploying consumer workloads. Here is our setup architecture!",
            mediaUrl:
              "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
            mediaType: "image",
            upvotes: ["u1", "u4"],
            downvotes: [],
            replyTo: {
              _id: "msg_1",
              content: "How are you managing schema registry evolution across decoupled Kafka event consumers?",
              senderId: { name: "Alex Mercer", username: "alexm" },
            },
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ];
      });
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchMessages();
  }, [id]);

  // Socket.IO Realtime integration
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_community", id);

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    };

    const handleMessageVoted = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on("new_community_message", handleNewMessage);
    socket.on("community_message_voted", handleMessageVoted);
    socket.on("community_message_deleted", handleMessageDeleted);

    return () => {
      socket.emit("leave_community", id);
      socket.off("new_community_message", handleNewMessage);
      socket.off("community_message_voted", handleMessageVoted);
      socket.off("community_message_deleted", handleMessageDeleted);
    };
  }, [socket, id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Permissions
  const creatorIdStr = community?.creatorId?._id || community?.creatorId;
  const isOwner = currentUserId && creatorIdStr?.toString() === currentUserId.toString();
  const isModerator =
    community?.moderators?.some(
      (m) => (m._id || m).toString() === currentUserId?.toString()
    ) || isOwner;
  const isMember =
    community?.members?.some(
      (m) => (m._id || m).toString() === currentUserId?.toString()
    ) || isOwner;

  // Toggle Join / Leave
  const handleToggleJoin = async () => {
    try {
      const res = await api.toggleCommunityMembership(community?._id || id);
      if (res.data?.data?.community) {
        setCommunity(res.data.data.community);
      } else {
        setCommunity((prev) => {
          if (!prev) return prev;
          const nextMembers = isMember
            ? (prev.members || []).filter((m) => (m._id || m) !== currentUserId)
            : [...(prev.members || []), { _id: currentUserId, name: currentUser?.name || "Me" }];
          return { ...prev, members: nextMembers };
        });
      }
    } catch (err) {
      // Local optimistic toggle
      setCommunity((prev) => {
        if (!prev) return prev;
        const nextMembers = isMember
          ? (prev.members || []).filter((m) => (m._id || m) !== currentUserId)
          : [...(prev.members || []), { _id: currentUserId, name: currentUser?.name || "Me" }];
        return { ...prev, members: nextMembers };
      });
    }
  };

  // Handle Image File Selection
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedImage && !imagePreview) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      if (messageText.trim()) formData.append("content", messageText.trim());
      if (replyingTo) formData.append("replyTo", replyingTo._id);

      if (selectedImage) {
        formData.append("media", selectedImage);
      } else if (imagePreview) {
        formData.append("mediaUrl", imagePreview);
        formData.append("mediaType", "image");
      }

      const res = await api.sendCommunityMessage(community?._id || id, formData);
      if (res.data?.data?.message) {
        const sent = res.data.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m._id === sent._id)) return prev;
          return [...prev, sent];
        });
      } else {
        // Local optimistic append
        const mockMsg = {
          _id: `msg_${Date.now()}`,
          senderId: {
            _id: currentUserId || "me",
            name: currentUser?.name || "You",
            username: currentUser?.username || "you",
            headline: currentUser?.headline || "Software Engineer",
            profilePicture: currentUser?.profilePicture || "",
          },
          content: messageText.trim(),
          mediaUrl: imagePreview,
          mediaType: imagePreview ? "image" : "none",
          replyTo: replyingTo
            ? {
                _id: replyingTo._id,
                content: replyingTo.content,
                senderId: replyingTo.senderId,
              }
            : null,
          upvotes: [],
          downvotes: [],
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, mockMsg]);
      }

      setMessageText("");
      setReplyingTo(null);
      removeSelectedImage();
      scrollToBottom();
    } catch (err) {
      // Optimistic append fallback
      const mockMsg = {
        _id: `msg_${Date.now()}`,
        senderId: {
          _id: currentUserId || "me",
          name: currentUser?.name || "You",
          username: currentUser?.username || "you",
          headline: currentUser?.headline || "Software Engineer",
          profilePicture: currentUser?.profilePicture || "",
        },
        content: messageText.trim(),
        mediaUrl: imagePreview,
        mediaType: imagePreview ? "image" : "none",
        replyTo: replyingTo
          ? {
              _id: replyingTo._id,
              content: replyingTo.content,
              senderId: replyingTo.senderId,
            }
          : null,
        upvotes: [],
        downvotes: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, mockMsg]);
      setMessageText("");
      setReplyingTo(null);
      removeSelectedImage();
      scrollToBottom();
    } finally {
      setIsSending(false);
    }
  };

  // Upvote / Downvote
  const handleVote = async (messageId, voteType) => {
    try {
      const res = await api.voteCommunityMessage(community?._id || id, messageId, voteType);
      if (res.data?.data?.message) {
        const updated = res.data.data.message;
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? updated : m))
        );
      } else {
        throw new Error("Local fallback");
      }
    } catch (e) {
      // Local optimistic vote update
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          const uId = currentUserId || "me";
          let up = [...(m.upvotes || [])];
          let down = [...(m.downvotes || [])];

          if (voteType === "upvote") {
            if (up.includes(uId)) {
              up = up.filter((u) => u !== uId);
            } else {
              up.push(uId);
              down = down.filter((u) => u !== uId);
            }
          } else if (voteType === "downvote") {
            if (down.includes(uId)) {
              down = down.filter((u) => u !== uId);
            } else {
              down.push(uId);
              up = up.filter((u) => u !== uId);
            }
          }
          return { ...m, upvotes: up, downvotes: down };
        })
      );
    }
  };

  // Delete Message
  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.deleteCommunityMessage(community?._id || id, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    }
  };

  // Save Settings Modal (Owner / Moderator)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      const payload = {
        name: isOwner ? editName.trim() : undefined,
        description: editDesc.trim(),
        category: editCategory,
        icon: editIcon,
        banner: editBanner,
        rules: editRules,
        isPrivate: editIsPrivate,
      };

      const res = await api.updateCommunitySettings(community?._id || id, payload);
      if (res.data?.data?.community) {
        setCommunity(res.data.data.community);
      } else {
        setCommunity((prev) => ({ ...prev, ...payload }));
      }
      setIsSettingsOpen(false);
    } catch (err) {
      setCommunity((prev) => ({
        ...prev,
        description: editDesc,
        category: editCategory,
        icon: editIcon,
        banner: editBanner,
        rules: editRules.split("\n").filter(Boolean),
      }));
      setIsSettingsOpen(false);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Moderator Management (Owner Only)
  const handleToggleModerator = async (targetUserId, currentIsMod) => {
    try {
      const action = currentIsMod ? "remove" : "add";
      const res = await api.manageCommunityModerator(community?._id || id, {
        targetUserId,
        action,
      });

      if (res.data?.data?.community) {
        setCommunity(res.data.data.community);
      } else {
        setCommunity((prev) => {
          let updatedMods = [...(prev.moderators || [])];
          if (currentIsMod) {
            updatedMods = updatedMods.filter((m) => (m._id || m) !== targetUserId);
          } else {
            const memberObj = (prev.members || []).find((m) => (m._id || m) === targetUserId);
            if (memberObj) updatedMods.push(memberObj);
          }
          return { ...prev, moderators: updatedMods };
        });
      }
    } catch (err) {
      setCommunity((prev) => {
        let updatedMods = [...(prev.moderators || [])];
        if (currentIsMod) {
          updatedMods = updatedMods.filter((m) => (m._id || m) !== targetUserId);
        } else {
          const memberObj = (prev.members || []).find((m) => (m._id || m) === targetUserId);
          if (memberObj) updatedMods.push(memberObj);
        }
        return { ...prev, moderators: updatedMods };
      });
    }
  };

  const memberList = community?.members || [];
  const moderatorList = community?.moderators || [];

  return (
    <UserLayout>
      <Head>
        <title>{community?.name || "Community Group"} | ProConnect</title>
      </Head>
      <DashBoardLayout requireAuth={false}>
        <div className={styles.container}>
          <Link href="/communities" className={styles.backBtn}>
            ← Back to All Groups
          </Link>

          {/* Group Hero Banner Card */}
          <div className={styles.bannerCard}>
            <div
              className={styles.bannerImage}
              style={{
                backgroundImage: `url(${community?.banner || PRESET_BANNERS[0]})`,
              }}
            >
              <div className={styles.bannerOverlay} />
              {isModerator && (
                <button
                  className={styles.bannerEditBtn}
                  onClick={() => setIsSettingsOpen(true)}
                >
                  ⚙️ Group Settings
                </button>
              )}
            </div>

            <div className={styles.bannerInfo}>
              <div className={styles.bannerTopRow}>
                <div className={styles.bannerMain}>
                  <div className={styles.groupIcon}>{community?.icon || "👥"}</div>
                  <div className={styles.groupTitles}>
                    <div className={styles.groupTitleRow}>
                      <h1 className={styles.groupTitle}>{community?.name}</h1>
                      <span className={styles.categoryBadge}>
                        {community?.category || "General"}
                      </span>
                      {community?.isPrivate && (
                        <span className={styles.privacyBadge}>🔒 Private</span>
                      )}
                    </div>
                    <div className={styles.groupMetaRow}>
                      <span className={styles.metaItem}>
                        👥 <strong className={styles.metaHighlight}>{memberList.length}</strong> members
                      </span>
                      <span className={styles.metaItem}>
                        🛡️ <strong className={styles.metaHighlight}>{moderatorList.length}</strong> moderators
                      </span>
                      <span className={styles.metaItem}>
                        👑 Created by{" "}
                        <strong className={styles.metaHighlight}>
                          @{community?.creatorId?.username || community?.creatorId?.name || "Creator"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.bannerActions}>
                  <button
                    className={`${styles.joinBtn} ${isMember ? styles.joinedBtn : ""}`}
                    onClick={handleToggleJoin}
                  >
                    {isMember ? "✓ Joined" : "+ Join Group"}
                  </button>
                  {isOwner && (
                    <button
                      className={styles.settingsBtn}
                      onClick={() => setIsMembersModalOpen(true)}
                    >
                      🛡️ Manage Mods
                    </button>
                  )}
                </div>
              </div>

              {/* Top Navigation Action Buttons: About, Rules, Members */}
              <div className={styles.topNavButtons}>
                <div className={styles.topPillsGroup}>
                  <button
                    className={`${styles.headerPillBtn} ${isAboutModalOpen ? styles.headerPillActive : ""}`}
                    onClick={() => setIsAboutModalOpen(true)}
                  >
                    📋 About Group
                  </button>
                  <button
                    className={`${styles.headerPillBtn} ${isRulesModalOpen ? styles.headerPillActive : ""}`}
                    onClick={() => setIsRulesModalOpen(true)}
                  >
                    📜 Community Rules
                  </button>
                  <button
                    className={`${styles.headerPillBtn} ${isMembersModalOpen ? styles.headerPillActive : ""}`}
                    onClick={() => setIsMembersModalOpen(true)}
                  >
                    👥 Members & Leaders ({memberList.length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Main Stage Group Chat */}
          <div className={styles.chatSection}>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <div className={styles.liveDot} />
                <span className={styles.chatHeaderTitle}>Live Group Discussion & Chat</span>
              </div>
              <span className={styles.chatCount}>{messages.length} messages</span>
            </div>

            {/* Messages Feed */}
            <div className={styles.messagesList}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", margin: "auto" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💬</div>
                  <h3>No messages yet</h3>
                  <p>Be the first to share an insight or question with the group!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const sender = msg.senderId || {};
                  const sId = (sender._id || sender).toString();
                  const isMsgOwner = sId === creatorIdStr?.toString();
                  const isMsgMod = moderatorList.some(
                    (m) => (m._id || m).toString() === sId
                  );
                  const canDelete =
                    sId === currentUserId?.toString() || isOwner || isModerator;

                  const upvoteList = (msg.upvotes || []).map((u) => (u._id || u).toString());
                  const downvoteList = (msg.downvotes || []).map((u) => (u._id || u).toString());
                  const hasUpvoted = currentUserId && upvoteList.includes(currentUserId.toString());
                  const hasDownvoted = currentUserId && downvoteList.includes(currentUserId.toString());
                  const voteScore = upvoteList.length - downvoteList.length;

                  return (
                    <div key={msg._id} className={styles.messageItem}>
                      <img
                        src={
                          sender.profilePicture ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${sender.username || "user"}`
                        }
                        alt={sender.name || "User"}
                        className={styles.messageAvatar}
                      />

                      <div className={styles.messageContentWrapper}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageAuthor}>
                            {sender.name || "Member"}
                          </span>
                          {isMsgOwner ? (
                            <span className={`${styles.authorRoleBadge} ${styles.roleOwner}`}>
                              👑 Owner
                            </span>
                          ) : isMsgMod ? (
                            <span className={`${styles.authorRoleBadge} ${styles.roleMod}`}>
                              🛡️ Mod
                            </span>
                          ) : (
                            <span className={`${styles.authorRoleBadge} ${styles.roleMember}`}>
                              Member
                            </span>
                          )}
                          <span className={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Reply Quote Banner if replying */}
                        {msg.replyTo && (
                          <div className={styles.replyQuote}>
                            <span className={styles.replyQuoteAuthor}>
                              ↩ Replying to @{msg.replyTo.senderId?.username || msg.replyTo.senderId?.name || "Member"}:
                            </span>
                            <span className={styles.replyQuoteText}>
                              "{msg.replyTo.content || "Attached media"}"
                            </span>
                          </div>
                        )}

                        {/* Message Body Text */}
                        {msg.content && (
                          <div className={styles.messageText}>{msg.content}</div>
                        )}

                        {/* Attached Image/Media */}
                        {msg.mediaUrl && (
                          <img
                            src={msg.mediaUrl}
                            alt="Attached media"
                            className={styles.messageMedia}
                            onClick={() => window.open(msg.mediaUrl, "_blank")}
                          />
                        )}

                        {/* Message Actions (Upvote, Downvote, Reply, Delete) */}
                        <div className={styles.messageActions}>
                          <div className={styles.voteGroup}>
                            <button
                              className={`${styles.voteBtn} ${
                                hasUpvoted ? styles.upvoteActive : ""
                              }`}
                              onClick={() => handleVote(msg._id, "upvote")}
                              title="Upvote message"
                            >
                              ▲
                            </button>
                            <span className={styles.voteScore}>{voteScore}</span>
                            <button
                              className={`${styles.voteBtn} ${
                                hasDownvoted ? styles.downvoteActive : ""
                              }`}
                              onClick={() => handleVote(msg._id, "downvote")}
                              title="Downvote message"
                            >
                              ▼
                            </button>
                          </div>

                          <button
                            className={styles.actionBtn}
                            onClick={() => {
                              setReplyingTo(msg);
                            }}
                          >
                            💬 Reply
                          </button>

                          {canDelete && (
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDeleteMessage(msg._id)}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Box */}
            <div className={styles.chatInputArea}>
              {/* Active Reply Banner */}
              {replyingTo && (
                <div className={styles.activeReplyBar}>
                  <div className={styles.activeReplyText}>
                    <span>↩</span>
                    <span>
                      Replying to{" "}
                      <strong>
                        @{replyingTo.senderId?.username || replyingTo.senderId?.name || "Member"}
                      </strong>
                      : "{replyingTo.content?.slice(0, 45)}
                      {replyingTo.content?.length > 45 ? "..." : ""}"
                    </span>
                  </div>
                  <button
                    className={styles.cancelReplyBtn}
                    onClick={() => setReplyingTo(null)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Selected Image Preview */}
              {imagePreview && (
                <div className={styles.imagePreviewBox}>
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className={styles.imagePreviewThumb}
                  />
                  <button
                    className={styles.removeImageBtn}
                    onClick={removeSelectedImage}
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImagePick}
                />

                <button
                  type="button"
                  className={styles.attachBtn}
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload image"
                >
                  📷
                </button>

                <textarea
                  className={styles.inputField}
                  placeholder="Share knowledge or reply to the group... (Enter to send)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                />

                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={isSending || (!messageText.trim() && !imagePreview)}
                >
                  {isSending ? "..." : "Send →"}
                </button>
              </form>
            </div>
          </div>

          {/* Modal: About Group */}
          {isAboutModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={() => setIsAboutModalOpen(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>About {community?.name}</h2>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => setIsAboutModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.aboutModalBody}>
                  <p>{community?.description}</p>
                  <div className={styles.aboutMetaGrid}>
                    <div>
                      <div className={styles.aboutMetaLabel}>Category</div>
                      <div className={styles.aboutMetaValue}>{community?.category || "General"}</div>
                    </div>
                    <div>
                      <div className={styles.aboutMetaLabel}>Privacy</div>
                      <div className={styles.aboutMetaValue}>
                        {community?.isPrivate ? "🔒 Private" : "🌐 Public Group"}
                      </div>
                    </div>
                    <div>
                      <div className={styles.aboutMetaLabel}>Total Members</div>
                      <div className={styles.aboutMetaValue}>{memberList.length} professionals</div>
                    </div>
                    <div>
                      <div className={styles.aboutMetaLabel}>Moderators</div>
                      <div className={styles.aboutMetaValue}>{moderatorList.length} verified</div>
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={() => setIsAboutModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Community Rules */}
          {isRulesModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={() => setIsRulesModalOpen(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Community Rules & Guidelines</h2>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => setIsRulesModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <ul className={styles.rulesList}>
                  {Array.isArray(community?.rules) && community.rules.length > 0 ? (
                    community.rules.map((rule, idx) => (
                      <li key={idx} className={styles.ruleItem}>
                        <span className={styles.ruleNumber}>{idx + 1}.</span>
                        <span>{rule}</span>
                      </li>
                    ))
                  ) : (
                    <li className={styles.ruleItem}>
                      <span className={styles.ruleNumber}>1.</span>
                      <span>Be respectful and share technical, high-quality knowledge.</span>
                    </li>
                  )}
                </ul>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={() => setIsRulesModalOpen(false)}
                  >
                    Understood
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Members & Moderator Management */}
          {isMembersModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={() => setIsMembersModalOpen(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div>
                    <h2 className={styles.modalTitle}>Members & Group Leadership</h2>
                    {isOwner && (
                      <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.2rem 0 0" }}>
                        As the group creator/owner, you can appoint or remove moderators.
                      </p>
                    )}
                  </div>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => setIsMembersModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Search group members..."
                    value={modSearch}
                    onChange={(e) => setModSearch(e.target.value)}
                  />
                </div>

                <div className={styles.modMemberList}>
                  {/* Creator */}
                  <div className={styles.modMemberRow}>
                    <div className={styles.memberInfo}>
                      <img
                        src={
                          community?.creatorId?.profilePicture ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${community?.creatorId?.username || "creator"}`
                        }
                        alt="Owner"
                        className={styles.memberAvatar}
                      />
                      <div>
                        <div className={styles.memberName}>
                          {community?.creatorId?.name || "Creator"}
                        </div>
                        <div className={styles.memberRole}>
                          @{community?.creatorId?.username || "owner"} • 👑 Group Owner
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members & Moderators */}
                  {memberList
                    .filter((m) => (m._id || m).toString() !== creatorIdStr?.toString())
                    .filter(
                      (m) =>
                        !modSearch ||
                        m.name?.toLowerCase().includes(modSearch.toLowerCase()) ||
                        m.username?.toLowerCase().includes(modSearch.toLowerCase())
                    )
                    .map((member) => {
                      const mId = (member._id || member).toString();
                      const isMod = moderatorList.some(
                        (mod) => (mod._id || mod).toString() === mId
                      );

                      return (
                        <div key={mId} className={styles.modMemberRow}>
                          <div className={styles.memberInfo}>
                            <img
                              src={
                                member.profilePicture ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${member.username || "member"}`
                              }
                              alt={member.name}
                              className={styles.memberAvatar}
                            />
                            <div>
                              <div className={styles.memberName}>{member.name}</div>
                              <div className={styles.memberRole}>
                                @{member.username} {isMod ? "• 🛡️ Moderator" : "• Member"}
                              </div>
                            </div>
                          </div>

                          {isOwner && (
                            <button
                              className={`${styles.modToggleBtn} ${
                                isMod ? styles.demoteBtn : styles.promoteBtn
                              }`}
                              onClick={() => handleToggleModerator(mId, isMod)}
                            >
                              {isMod ? "Demote Moderator" : "Appoint Moderator"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={() => setIsMembersModalOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Group Settings Modal (Owner & Moderator) */}
          {isSettingsOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={() => setIsSettingsOpen(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Group Settings</h2>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveSettings}>
                  {isOwner && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Group Name</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select
                      className={styles.formSelect}
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Group Icon / Emoji</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea
                      className={styles.formTextarea}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Group Banner</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Banner image URL"
                      value={editBanner}
                      onChange={(e) => setEditBanner(e.target.value)}
                    />
                    <div className={styles.presetBanners}>
                      {PRESET_BANNERS.map((bannerUrl, idx) => (
                        <div
                          key={idx}
                          className={`${styles.presetBannerThumb} ${
                            editBanner === bannerUrl
                              ? styles.presetBannerThumbActive
                              : ""
                          }`}
                          style={{ backgroundImage: `url(${bannerUrl})` }}
                          onClick={() => setEditBanner(bannerUrl)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Community Rules (one per line)</label>
                    <textarea
                      className={styles.formTextarea}
                      value={editRules}
                      onChange={(e) => setEditRules(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSavingSettings}
                    >
                      {isSavingSettings ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
