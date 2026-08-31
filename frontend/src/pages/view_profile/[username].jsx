import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, clientServer } from "@/config";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "../profile/index.module.css";
import { getAllPosts, incrementLike, decrementLike } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/userAction";

const DEFAULT_BANNER = "https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [connecting, setConnecting] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likingPosts, setLikingPosts] = useState(new Set());

  const user = userProfile?.userId;
  const targetId = (user?._id || user?.id)?.toString();

  const loggedInUsername = authState?.user?.userId?.username || authState?.user?.username;
  const loggedInUserId = (authState?.user?.userId?._id || authState?.user?._id)?.toString();
  const isMyProfile =
    (loggedInUsername && user?.username && loggedInUsername.toLowerCase() === user.username.toLowerCase()) ||
    (loggedInUserId && targetId && loggedInUserId === targetId);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      dispatch(getAllPosts());
      dispatch(getConnectionsRequest(token));
      dispatch(getMyConnectionsRequest(token));
    }
  }, [dispatch]);

  // Determine connection status
  const connectionStatus = useMemo(() => {
    if (!targetId || !loggedInUserId || isMyProfile) return "SELF";

    const rawList = [
      ...(Array.isArray(authState.connectionRequests) ? authState.connectionRequests : []),
      ...(Array.isArray(authState.connections) ? authState.connections : []),
    ];

    const match = rawList.find((c) => {
      const uId = (c.userId?._id || c.userId)?.toString();
      const cId = (c.connectionId?._id || c.connectionId)?.toString();
      return (
        (uId === loggedInUserId && cId === targetId) ||
        (cId === loggedInUserId && uId === targetId)
      );
    });

    if (!match) return "NONE";
    return match.status_accepted === true ? "CONNECTED" : "PENDING";
  }, [authState.connections, authState.connectionRequests, targetId, loggedInUserId, isMyProfile]);

  // Posts by this user
  const userPosts = useMemo(() => {
    if (!user?.username && !targetId) return [];
    return (postReducer.posts || []).filter((post) => {
      const pUsername = post.userId?.username;
      const pId = (post.userId?._id || post.userId?.id || post.userId)?.toString();
      return (
        (user?.username && pUsername === user.username) ||
        (targetId && pId && pId === targetId)
      );
    });
  }, [postReducer.posts, user?.username, targetId]);

  const getImageUrl = (imagePath, name = "User") => {
    if (!imagePath)
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&bold=true`;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  const handleConnect = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setConnecting(true);
      await dispatch(
        sendConnectionRequest({
          token,
          connectionId: targetId,
        })
      );
    } catch (err) {
      console.error("Connect error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDownloadProfile = async () => {
    try {
      const response = await clientServer.get(`/user/download_profile?id=${targetId}`);
      if (response.data?.message) {
        window.open(`${BASE_URL}/uploads/${response.data.message}`, "_blank");
      }
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download profile PDF.");
    }
  };

  if (!userProfile || !user) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div style={{ padding: "4rem 2rem", textAlign: "center", background: "#ffffff", borderRadius: "12px", margin: "2rem auto", maxWidth: "600px" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "0.5rem" }}>Profile Not Found</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>The professional you are looking for does not exist or has been removed.</p>
            <button
              onClick={() => router.push("/myConnections")}
              style={{ background: "#0a66c2", color: "#fff", border: "none", padding: "0.6rem 1.5rem", borderRadius: "20px", fontWeight: "600", cursor: "pointer" }}
            >
              Discover People
            </button>
          </div>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  const { bio, currentPost, location, pastWork = [], education = [], skills = [], coverPicture } = userProfile;
  const bannerImg = coverPicture || DEFAULT_BANNER;

  return (
    <UserLayout>
      <Head>
        <title>{user.name ? `${user.name} | ProConnect Profile` : "Profile | ProConnect 2.0"}</title>
        <meta
          name="description"
          content={`Connect with ${user.name || "Professional"} on ProConnect.`}
        />
      </Head>

      <DashBoardLayout>
        <div className={styles.profilePageWrapper}>
          {/* ================= 1. PROFILE HEADER CARD ================= */}
          <div className={styles.profileHeaderCard}>
            {/* Cover Banner */}
            <div
              className={styles.bannerBackdrop}
              style={{ backgroundImage: `url(${bannerImg})` }}
            >
              <div className={styles.bannerOverlay}></div>
            </div>

            {/* Avatar & Actions */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <img
                  className={styles.profileAvatar}
                  src={getImageUrl(user.profilePicture, user.name)}
                  alt={user.name || "Profile"}
                />
              </div>

              {/* Action Buttons */}
              <div className={styles.headerActionButtons}>
                {isMyProfile ? (
                  <button
                    className={styles.editProfileBtn}
                    onClick={() => router.push("/profile")}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Edit My Profile</span>
                  </button>
                ) : connectionStatus === "CONNECTED" ? (
                  <>
                    <button
                      className={styles.editProfileBtn}
                      style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", boxShadow: "none" }}
                      disabled
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Connected</span>
                    </button>
                    <button
                      className={styles.editProfileBtn}
                      onClick={() => router.push(`/messages?userId=${targetId}`)}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>Message</span>
                    </button>
                  </>
                ) : connectionStatus === "PENDING" ? (
                  <button
                    className={styles.editProfileBtn}
                    style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", boxShadow: "none" }}
                    disabled
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Request Pending</span>
                  </button>
                ) : (
                  <button
                    className={styles.editProfileBtn}
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    <span>{connecting ? "Connecting..." : "Connect"}</span>
                  </button>
                )}

                <button
                  className={styles.downloadPdfBtn}
                  onClick={handleDownloadProfile}
                  title="Download Profile Resume PDF"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Resume</span>
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className={styles.profileDetailsContent}>
              <div className={styles.nameRow}>
                <h1 className={styles.profileName}>{user.name}</h1>
                <span className={styles.profileHandle}>@{user.username}</span>
              </div>

              <p className={styles.profileHeadline}>
                {currentPost || bio || "Software Professional • Open to Opportunities"}
              </p>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {location || "Global"}
                </span>

                <span className={styles.metaBadge}>Pro Member</span>
              </div>
            </div>
          </div>

          {/* ================= 2. ABOUT SECTION ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h2>About</h2>
              </div>
            </div>

            <div className={styles.aboutContent}>
              {bio ? (
                <p className={styles.aboutText}>{bio}</p>
              ) : (
                <p className={styles.emptyPrompt}>No summary provided yet.</p>
              )}
            </div>
          </div>

          {/* ================= 3. WORK EXPERIENCE ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <h2>Experience</h2>
              </div>
            </div>

            <div className={styles.timelineList}>
              {pastWork && pastWork.length > 0 ? (
                pastWork.map((work, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0a66c2" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    </div>
                    <div className={styles.timelineContent}>
                      <h3 className={styles.itemTitle}>{work.position || "Position"}</h3>
                      <h4 className={styles.itemSubtitle}>{work.company || "Company"}</h4>
                      <div className={styles.itemMeta}>
                        {work.years && <span className={styles.metaChip}>{work.years}</span>}
                        {work.location && <span className={styles.metaLocation}>• {work.location}</span>}
                      </div>
                      {work.description && <p className={styles.itemDescription}>{work.description}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyPrompt}>No past work information available.</p>
              )}
            </div>
          </div>

          {/* ================= 4. EDUCATION ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <h2>Education</h2>
              </div>
            </div>

            <div className={styles.timelineList}>
              {education && education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0a66c2" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                    </div>
                    <div className={styles.timelineContent}>
                      <h3 className={styles.itemTitle}>{edu.school}</h3>
                      <h4 className={styles.itemSubtitle}>
                        {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" • ")}
                      </h4>
                      {(edu.startDate || edu.endDate) && (
                        <div className={styles.itemMeta}>
                          <span className={styles.metaChip}>
                            {[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}
                          </span>
                        </div>
                      )}
                      {edu.description && <p className={styles.itemDescription}>{edu.description}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyPrompt}>No education information listed.</p>
              )}
            </div>
          </div>

          {/* ================= 5. SKILLS ================= */}
          {skills && skills.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleRow}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <h2>Skills & Expertise</h2>
                </div>
              </div>
              <div className={styles.skillsWrapper}>
                {skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillChip}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ================= 6. RECENT ACTIVITY ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <h2>Recent Activity ({userPosts.length})</h2>
              </div>
            </div>

            <div className={styles.postsList}>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post._id} className={styles.postCardItem}>
                    <div className={styles.postCardHeader}>
                      <img
                        src={getImageUrl(user.profilePicture, user.name)}
                        alt={user.name}
                        className={styles.postCardAvatar}
                      />
                      <div className={styles.postCardUserInfo}>
                        <strong>{user.name}</strong>
                        <span>@{user.username} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className={styles.postBodyText}>{post.body}</p>

                    {post.media && (
                      <div className={styles.postMediaWrapper}>
                        <img src={getImageUrl(post.media)} alt="Post Attachment" />
                      </div>
                    )}

                    <div className={styles.postFooterBar}>
                      <span>❤️ {post.likesCount || 0} Likes</span>
                      <span>💬 {post.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyPostsState}>
                  <p>No recent activity or posts yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const username = context.query.username;
    const response = await clientServer.get(
      "/user/get_userProfile_basedOn_username",
      { params: { username } },
    );
    return { props: { userProfile: response.data?.userProfile || null } };
  } catch (error) {
    return { props: { userProfile: null } };
  }
}
