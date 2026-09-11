import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "./dashboard/dashBoard.module.css";
import {
  createPost,
  deletePost,
  getAboutUser,
  getAllComents,
  getAllPosts,
  getAllUsers,
  incrementLike,
  decrementLike,
  postOnComment,
} from "@/config/redux/action/postAction";
import { resetPostId } from "@/config/redux/reducre/postReducer";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const hasFetchedData = useRef(false);
  const [mounted, setMounted] = useState(false);

  // Cache user from localStorage on mount to prevent SSR mismatch
  const [cachedUser, setCachedUser] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [shareToast, setShareToast] = useState(false);

  // Dedicated Comment Modal State
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [modalCommentText, setModalCommentText] = useState("");

  // Newly created posts pinned to top of feed
  const [newlyCreatedPosts, setNewlyCreatedPosts] = useState([]);




  useEffect(() => {
    setMounted(true);
    const savedLikes = localStorage.getItem("likedPosts");
    if (savedLikes) {
      try {
        setLikedPosts(new Set(JSON.parse(savedLikes)));
      } catch (e) {
        console.error("Error loading liked posts:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
    }
  }, [likedPosts, mounted]);

  useEffect(() => {
    if (hasFetchedData.current) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userString = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (userString) {
      try {
        const savedUser = JSON.parse(userString);
        setCachedUser(savedUser);
        if (!authState.user) {
          dispatch({ type: "SET_USER", payload: savedUser });
        }
      } catch (e) {
        localStorage.removeItem("user");
      }
    }

    if (token) {
      dispatch(getAboutUser({ token }));
    }

    dispatch(getAllPosts());
    dispatch(getAllUsers());
    hasFetchedData.current = true;
  }, []);

  const isLoggedIn =
    mounted &&
    (Boolean(authState?.user) ||
      (typeof window !== "undefined" && Boolean(localStorage.getItem("token"))));

  const activeUser = authState?.user || cachedUser;
  const currentUserName = activeUser?.userId?.name || activeUser?.name || "";
  const currentUserAvatar =
    authState?.user?.userId?.profilePicture ||
    authState?.user?.profilePicture ||
    cachedUser?.userId?.profilePicture ||
    cachedUser?.profilePicture ||
    (currentUserName
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=0a66c2&color=fff&bold=true`
      : "");

  const currentUserId = (authState?.user?.userId?._id || authState?.user?._id || cachedUser?.userId?._id || cachedUser?._id)?.toString();
  const currentUsername = authState?.user?.userId?.username || authState?.user?.username || cachedUser?.userId?.username || cachedUser?.username;

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return `https://ui-avatars.com/api/?name=U&background=0a66c2&color=fff&bold=true`;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return imagePath;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileContent(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Navigating to profile: ALWAYS go to /profile if own post!
  const handleAuthorClick = (author) => {
    const authorUsername = author?.username;
    const authorId = (author?._id || author?.userId?._id || author?.userId)?.toString();

    const isOwnProfile =
      isLoggedIn &&
      ((currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) ||
        (currentUserId && authorId && currentUserId === authorId));

    if (isOwnProfile) {
      router.push("/profile");
    } else if (authorUsername) {
      router.push(`/view_profile/${authorUsername}`);
    }
  };

  const handleUpload = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!postContent.trim() && !fileContent) return;

    try {
      setIsSubmitting(true);
      const textToPost = postContent;
      const mediaToPost = filePreview;

      // Create a local optimistic post object immediately placed at the TOP
      const localNewPost = {
        _id: "local_" + Date.now(),
        body: textToPost,
        media: mediaToPost,
        likes: 0,
        createdAt: new Date().toISOString(),
        userId: {
          _id: currentUserId,
          name: authState?.user?.userId?.name || authState?.user?.name || "You",
          username: currentUsername || "me",
          profilePicture: currentUserAvatar,
          bio: authState?.user?.bio || "Software Engineer",
        },
      };

      setNewlyCreatedPosts((prev) => [localNewPost, ...prev]);

      await dispatch(createPost({ media: fileContent, body: textToPost }));
      setPostContent("");
      setFileContent(null);
      setFilePreview(null);
      await dispatch(getAllPosts());
    } catch (err) {
      console.error("Post creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (likingPosts.has(postId)) return;
    const isCurrentlyLiked = likedPosts.has(postId);

    try {
      setLikingPosts((prev) => new Set(prev).add(postId));

      if (isCurrentlyLiked) {
        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        if (!postId.startsWith("local_")) {
          await dispatch(decrementLike({ post_id: postId }));
        }
      } else {
        setLikedPosts((prev) => new Set(prev).add(postId));
        if (!postId.startsWith("local_")) {
          await dispatch(incrementLike({ post_id: postId }));
        }
      }
      if (!postId.startsWith("local_")) {
        await dispatch(getAllPosts());
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setLikingPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  // Open Comment Modal for any post
  const handleOpenCommentModal = async (post) => {
    setActiveModalPost(post);
    setModalCommentText("");
    if (post && post._id && !post._id.startsWith("showcase") && !post._id.startsWith("local_")) {
      await dispatch(getAllComents({ post_id: post._id }));
    }
  };

  const handleModalCommentSubmit = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!modalCommentText.trim() || !activeModalPost) return;

    // If commenting on showcase post
    if (activeModalPost._id === "showcase") {
      const newComment = {
        id: "sc_" + Date.now(),
        author: authState?.user?.userId?.name || authState?.user?.name || "You",
        role: authState?.user?.bio || "Software Engineer",
        avatar: currentUserAvatar,
        text: modalCommentText.trim(),
        time: "Just now",
      };
      setShowcaseComments([newComment, ...showcaseComments]);
      setModalCommentText("");
      return;
    }

    try {
      await dispatch(
        postOnComment({
          post_id: activeModalPost._id,
          body: modalCommentText,
        })
      );
      setModalCommentText("");
      await dispatch(getAllComents({ post_id: activeModalPost._id }));
    } catch (err) {
      console.error("Comment submission failed:", err);
    }
  };

  const handleShowcaseLike = () => {
    if (showcaseLiked) {
      setShowcaseLiked(false);
      setShowcaseLikeCount((prev) => prev - 1);
    } else {
      setShowcaseLiked(true);
      setShowcaseLikeCount((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        typeof window !== "undefined" ? window.location.href : "https://proconnect.com"
      );
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  // Ensure DB posts are strictly newest first (by createdAt or _id timestamp)
  const rawDbPosts = postState.posts || [];
  const dbPosts = [...rawDbPosts].sort((a, b) => {
    const timeA =
      new Date(a.createdAt || 0).getTime() ||
      parseInt((a._id || "").substring(0, 8), 16) * 1000 ||
      0;
    const timeB =
      new Date(b.createdAt || 0).getTime() ||
      parseInt((b._id || "").substring(0, 8), 16) * 1000 ||
      0;
    return timeB - timeA;
  });

  // Filter out any local posts that have already been synced with DB
  const filteredLocalPosts = newlyCreatedPosts.filter(
    (lp) =>
      !dbPosts.some(
        (dp) =>
          dp.body === lp.body &&
          (dp.userId?._id === lp.userId?._id || dp.userId === lp.userId?._id)
      )
  );

  // All user posts ordered strictly newest first on top!
  const allUserPosts = [...filteredLocalPosts, ...dbPosts];

  return (
    <UserLayout>
      <Head>
        <title>proConnect - Connect with professionals. Learn new skills. Grow together.</title>
        <meta
          name="description"
          content="proConnect professional networking platform. Connect with students and tech professionals, discover courses, and grow your career."
        />
      </Head>

      <DashBoardLayout requireAuth={false}>
        <div className={styles.feedWrapper}>
          {/* ================= POST COMPOSER ================= */}
          <div className={styles.composerCard}>
            <div className={styles.composerTopRow}>
              <img
                src={
                  currentUserAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName || "User")}&background=0a66c2&color=fff&bold=true`
                }
                alt="User"
                className={styles.composerAvatar}
                onClick={() => {
                  if (isLoggedIn) router.push("/profile");
                }}
                style={{ cursor: "pointer" }}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName || "User")}&background=0a66c2&color=fff&bold=true`;
                }}
              />
              <input
                id="mainPostComposer"
                type="text"
                className={styles.composerInput}
                placeholder="Start a post"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUpload();
                  }
                }}
              />
              {postContent.trim() || fileContent ? (
                <button
                  className={styles.submitPostBtn}
                  onClick={handleUpload}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              ) : null}
            </div>

            {/* File attachment preview */}
            {filePreview && (
              <div className={styles.previewContainer}>
                <img src={filePreview} alt="Preview" className={styles.previewImg} />
                <button
                  className={styles.removePreviewBtn}
                  onClick={() => {
                    setFileContent(null);
                    setFilePreview(null);
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Composer Action Options */}
            <div className={styles.composerActionsRow}>
              <label htmlFor="filePhotoUpload" className={styles.composerActionItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Image</span>
              </label>
              <input
                id="filePhotoUpload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <label htmlFor="fileVideoUpload" className={styles.composerActionItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Video</span>
              </label>
              <input
                id="fileVideoUpload"
                type="file"
                accept="video/*"
                hidden
                onChange={handleFileChange}
              />

              <button
                className={styles.composerActionItem}
                onClick={() => {
                  const composer = document.getElementById("mainPostComposer");
                  if (composer) {
                    composer.focus();
                    setPostContent("📝 **Article**: ");
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Article</span>
              </button>
            </div>
          </div>

          {/* ================= 3. POSTS FEED ================= */}
          <div className={styles.postsFeed}>
            {/* 1. ALL POSTS (NEWEST FIRST ON TOP) */}
            {allUserPosts.map((post) => {
              const isAuthor =
                isLoggedIn &&
                currentUserId &&
                post?.userId?._id &&
                String(post?.userId?._id) === String(currentUserId);

              const isLiked = likedPosts.has(post._id);
              const authorName = post?.userId?.name || "ProConnect Member";
              const authorRole =
                post?.userId?.bio || `@${post?.userId?.username || "member"}`;
              const authorAvatar = getImageUrl(post?.userId?.profilePicture);

              return (
                <article key={post._id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <div className={styles.postAuthorGroup}>
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className={styles.authorAvatar}
                        onClick={() => handleAuthorClick(post.userId)}
                      />
                      <div className={styles.authorMeta}>
                        <h3
                          className={styles.authorName}
                          onClick={() => handleAuthorClick(post.userId)}
                        >
                          {authorName}
                        </h3>
                        <p className={styles.authorHeadline}>{authorRole}</p>
                        <div className={styles.postTimeMeta}>
                          <span>Recent</span>
                          <span>·</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={styles.globeIcon}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {isAuthor && (
                      <button
                        className={styles.deletePostBtn}
                        title="Delete Post"
                        onClick={async () => {
                          if (post._id.startsWith("local_")) {
                            setNewlyCreatedPosts((prev) =>
                              prev.filter((p) => p._id !== post._id)
                            );
                          } else {
                            await dispatch(deletePost({ post_id: post._id }));
                            await dispatch(getAllPosts());
                          }
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {post.body && (
                    <div className={styles.postBody}>
                      <p>{post.body}</p>
                    </div>
                  )}

                  {post.media &&
                    typeof post.media === "string" &&
                    post.media !== "null" &&
                    post.media !== "undefined" &&
                    post.media.trim() !== "" && (
                      <div className={styles.postMediaContainer}>
                        <img
                          src={getImageUrl(post.media)}
                          alt=""
                          className={styles.postMediaImg}
                          loading="lazy"
                          onError={(e) => {
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.style.display = "none";
                            }
                          }}
                        />
                      </div>
                    )}

                  <div className={styles.postStatsBar}>
                    <div className={styles.reactionsCount}>
                      <div className={styles.reactionIconsGroup}>
                        <span className={`${styles.reactBadge} ${styles.reactThumb}`}>
                          👍
                        </span>
                        <span className={`${styles.reactBadge} ${styles.reactHeart}`}>
                          ❤️
                        </span>
                      </div>
                      <span className={styles.reactionsText}>
                        {post.likes || (isLiked ? 1 : 0)} reactions
                      </span>
                    </div>
                    <div
                      className={styles.commentsSharesCount}
                      onClick={() => handleOpenCommentModal(post)}
                      style={{ cursor: "pointer" }}
                    >
                      <span>Comments</span>
                    </div>
                  </div>

                  <div className={styles.postActionButtons}>
                    <button
                      className={`${styles.actionBtn} ${
                        isLiked ? styles.activeLiked : ""
                      }`}
                      onClick={() => handleLike(post._id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      <span>Like</span>
                    </button>

                    <button
                      className={styles.actionBtn}
                      onClick={() => handleOpenCommentModal(post)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      <span>Comment</span>
                    </button>

                    <button className={styles.actionBtn} onClick={handleShare}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      <span>Share</span>
                    </button>

                    <button
                      className={styles.actionBtn}
                      onClick={() => router.push("/messages")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span>Send</span>
                    </button>
                  </div>
                </article>
              );
            })}

            {/* 2. SKELETON LOADING ANIMATION (While posts are arriving) */}
            {allUserPosts.length === 0 && (!postState.postsFetched || postState.isLoading) && (
              <>
                {[1, 2].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader}>
                      <div className={`${styles.skeletonAvatar} ${styles.skeletonShimmer}`}></div>
                      <div className={styles.skeletonMeta}>
                        <div className={`${styles.skeletonLineTitle} ${styles.skeletonShimmer}`}></div>
                        <div className={`${styles.skeletonLineSubtitle} ${styles.skeletonShimmer}`}></div>
                      </div>
                    </div>
                    <div className={styles.skeletonBody}>
                      <div className={`${styles.skeletonLineLong} ${styles.skeletonShimmer}`}></div>
                      <div className={`${styles.skeletonLineMedium} ${styles.skeletonShimmer}`}></div>
                    </div>
                    <div className={`${styles.skeletonMediaBox} ${styles.skeletonShimmer}`}></div>
                    <div className={styles.skeletonActionsRow}>
                      <div className={`${styles.skeletonActionItem} ${styles.skeletonShimmer}`}></div>
                      <div className={`${styles.skeletonActionItem} ${styles.skeletonShimmer}`}></div>
                      <div className={`${styles.skeletonActionItem} ${styles.skeletonShimmer}`}></div>
                      <div className={`${styles.skeletonActionItem} ${styles.skeletonShimmer}`}></div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 3. CLEAN EMPTY FEED STATE (When feed has finished loading and no posts exist) */}
            {allUserPosts.length === 0 && postState.postsFetched && !postState.isLoading && (
              <div className={styles.emptyFeedCard}>
                <span className={styles.emptyFeedIcon}>✍️</span>
                <h3 className={styles.emptyFeedTitle}>No posts in your feed yet</h3>
                <p className={styles.emptyFeedSubtitle}>
                  Be the first to share an insight, project update, or start a discussion with your network!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= DEDICATED COMMENT MODAL ================= */}
        {activeModalPost && (
          <div
            className={styles.commentModalOverlay}
            onClick={() => {
              setActiveModalPost(null);
              dispatch(resetPostId());
            }}
          >
            <div
              className={styles.commentModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={styles.commentModalHeader}>
                <div className={styles.commentModalTitleGroup}>
                  <span className={styles.commentModalIcon}>💬</span>
                  <h3 className={styles.commentModalTitle}>Comments</h3>
                </div>
                <button
                  className={styles.commentModalCloseBtn}
                  onClick={() => {
                    setActiveModalPost(null);
                    dispatch(resetPostId());
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Compact Post Snippet */}
              <div className={styles.modalPostSnippet}>
                <img
                  src={getImageUrl(activeModalPost.userId?.profilePicture)}
                  alt={activeModalPost.userId?.name || "Author"}
                  className={styles.snippetAvatar}
                />
                <div className={styles.snippetMeta}>
                  <strong>
                    {activeModalPost.userId?.name || "ProConnect Member"}
                  </strong>
                  <span>{activeModalPost.userId?.bio || "Member"}</span>
                  <p className={styles.snippetBody}>{activeModalPost.body}</p>
                </div>
              </div>

              {/* Scrollable Comments Thread */}
              <div className={styles.modalCommentsThread}>
                {activeModalPost._id === "showcase" ? (
                  showcaseComments.map((c) => (
                    <div key={c.id} className={styles.commentItem}>
                      <img
                        src={c.avatar}
                        alt={c.author}
                        className={styles.commentItemAvatar}
                      />
                      <div className={styles.commentBubble}>
                        <div className={styles.commentAuthorRow}>
                          <strong>{c.author}</strong>
                          <span className={styles.commentRole}>{c.role}</span>
                          <span className={styles.commentTime}>{c.time}</span>
                        </div>
                        <p className={styles.commentText}>{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : postState.comments && postState.comments.length > 0 ? (
                  postState.comments.map((c) => (
                    <div key={c._id} className={styles.commentItem}>
                      <img
                        src={getImageUrl(c.userId?.profilePicture)}
                        alt={c.userId?.username || "User"}
                        className={styles.commentItemAvatar}
                      />
                      <div className={styles.commentBubble}>
                        <div className={styles.commentAuthorRow}>
                          <strong>@{c.userId?.username || "user"}</strong>
                        </div>
                        <p className={styles.commentText}>{c.commentBody}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noCommentsModalState}>
                    <span>💭</span>
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Comment Input Footer */}
              <div className={styles.modalCommentInputFooter}>
                <img
                  src={currentUserAvatar}
                  alt="You"
                  className={styles.modalFooterAvatar}
                />
                <input
                  type="text"
                  placeholder={
                    isLoggedIn
                      ? "Write a thoughtful comment..."
                      : "Please log in to comment"
                  }
                  disabled={!isLoggedIn}
                  value={modalCommentText}
                  onChange={(e) => setModalCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleModalCommentSubmit();
                  }}
                  className={styles.modalCommentInputField}
                />
                <button
                  className={styles.modalSubmitCommentBtn}
                  onClick={handleModalCommentSubmit}
                  disabled={!modalCommentText.trim() || !isLoggedIn}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Toast */}
        {shareToast && (
          <div className={styles.toast}>
            <span>🔗 Post link copied to clipboard!</span>
          </div>
        )}
      </DashBoardLayout>
    </UserLayout>
  );
}
