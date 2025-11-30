import {
  deletePost,
  getAboutUser,
  getAllPosts,
  incrementLike,
  decrementLike,
  getAllComents,
  postOnComment,
} from "@/config/redux/action/postAction";
import DashBoardLayout from "@/layout/dashboardLayout";
import { resetPostId } from "@/config/redux/reducre/postReducer";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL, clientServer } from "@/config";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [postComment, setPostComment] = useState("");

  useEffect(() => {
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
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
  }, [likedPosts]);

  const handleWorkInputData = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getAllPosts());
    }
  }, []);

  useEffect(() => {
    if (authState?.user) {
      setUserProfile(authState.user);
    }
  }, [authState.user]);

  useEffect(() => {
    if (authState?.user && postReducer.posts.length > 0) {
      const filteredPosts = postReducer.posts.filter(
        (post) => post.userId.username === authState.user.userId.username
      );
      setUserPosts(filteredPosts);
    }
  }, [authState?.user?.userId?.username, postReducer.posts]);

  if (!userProfile) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h3>Loading...</h3>
          </div>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  const { userId, bio, pastWork } = userProfile;

  const updateUserProfilePicture = async (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image (JPG, PNG, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    console.log("📤 Uploading file:", file.name);

    try {
      const response = await clientServer.post(
        "/profile_picture_update",
        formData
      );

      if (response.status === 200 && response.data.message) {
        const token = localStorage.getItem("token");
        await dispatch(getAboutUser({ token }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(" Upload failed:", error);
      console.error(" Backend error:", error.response?.data);
      alert(
        error.response?.data?.message ||
          "Failed to upload profile picture. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };
  const updateUserProfileData = async () => {
    try {
      await clientServer.post("/update_user_profile", {
        token: localStorage.getItem("token"),
        name: userProfile.userId.name,
      });

      await clientServer.post("/update_user_data", {
        token: localStorage.getItem("token"),
        bio: userProfile.bio,
        currentPost: userProfile.currentPost,
        pastWork: userProfile.pastWork,
        education: userProfile.education,
      });

      const token = localStorage.getItem("token");
      await dispatch(getAboutUser({ token }));

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://ui-avatars.com/api/?name=User&size=150&background=0D8ABC&color=fff";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";
  };

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <label
              htmlFor="profilePictureUpload"
              className={styles.backDropContainer_profilOverLay}
              style={{ cursor: uploading ? "not-allowed" : "pointer" }}
            >
              <p>{uploading ? "Uploading..." : "Edit"}</p>
            </label>
            <input
              onChange={(e) => {
                updateUserProfilePicture(e.target.files[0]);
              }}
              type="file"
              accept="image/*"
              id="profilePictureUpload"
              name="profile_picture"
              hidden
              disabled={uploading}
            />
            <img
              className={styles.profile_picture}
              src={getImageUrl(userId?.profilePicture)}
              alt="Profile"
            />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                Uploading...
              </div>
            )}
          </div>

          <div className={styles.profileContainer_details}>
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <div style={{ flex: "0.8" }}>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    gap: "1.2rem",
                  }}
                >
                  <input
                    onChange={(e) => {
                      setUserProfile({
                        ...userProfile,
                        userId: { ...userProfile.userId, name: e.target.value },
                      });
                    }}
                    type="text"
                    className={styles.nameEdit}
                    value={userId?.name || ""}
                  />
                </div>
                <div className={styles.bioText}>
                  <p>@{userId?.username}</p>
                  <textarea
                    value={bio || ""}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, bio: e.target.value });
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    maxLength={220}
                    placeholder="Write something about yourself..."
                  />
                  <p className={styles.BioClass}>{(bio || "").length}/220</p>
                </div>
              </div>

              <div
                className={styles.profileRecentActivity}
                style={{ flex: "0.2" }}
              >
                <h3>Recent Activity</h3>

                {userPosts?.length > 0 ? (
                  <div key={userPosts[0]._id} className={styles.postCard}>
                    <div className={styles.card}>
                      <div className={styles.postCard_profileContainer}>
                        {userPosts[0].media ? (
                          <img
                            src={getImageUrl(userPosts[0].media)}
                            alt="Post"
                          />
                        ) : (
                          <div
                            style={{ width: "3.4rem", height: "3.4rem" }}
                          ></div>
                        )}
                      </div>
                      <p>{userPosts[0].body}</p>
                    </div>
                  </div>
                ) : (
                  <p>No posts yet.</p>
                )}
              </div>
            </div>
          </div>

          {userProfile != authState.user && (
            <div onClick={() => updateUserProfileData()}>
              <button className={styles.acceptButton}>Update Profile</button>
            </div>
          )}

          <div className={styles.WorkHistory}>
            <div className={styles.workHistoryTag_btn}>
              <h4>Work History</h4>
              <button
                className={styles.AddWorkButton}
                onClick={() => setIsModalOpen(true)}
              >
                Add Your Work
              </button>
            </div>
            <div className={styles.WorkHistoryContainer}>
              {pastWork?.map((work, index) => (
                <div key={index} className={styles.WorkHistoryCard}>
                  <div className={styles.cardHeader}>
                    <h5>{work.company}</h5>
                    <span className={styles.years}>{work.years} yrs</span>
                  </div>
                  <p className={styles.position}>{work.position}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.PostsContainer} style={{ flex: "0.2" }}>
            <div className={styles.wrapper}>
              <h3 style={{ alignSelf: "start" }}>My Activity</h3>
              <h4 style={{ alignSelf: "start" }}>All Posts </h4>
              {userPosts?.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post._id} className={styles.singlecard}>
                    <div className={styles.singlecard_profileContainer}>
                      <img
                        onClick={() => router.push("/profile")}
                        src={getImageUrl(post.userId.profilePicture)}
                        alt={post.userId.name}
                      />
                      <div className={styles.userInfo}>
                        <p className={styles.userName}>{post.userId.name}</p>
                        <p className={styles.userHandle}>
                          @{post.userId.username}
                        </p>
                      </div>

                      {post.userId._id === authState.user.userId._id && (
                        <div
                          className={styles.deleteButton}
                          onClick={async () => {
                            await dispatch(deletePost({ post_id: post._id }));
                            await dispatch(getAllPosts());
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            width="20"
                            height="20"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <p className={styles.postContent}>{post.body}</p>

                    {post.media && (
                      <div className={styles.singlecardImage}>
                        <img src={getImageUrl(post.media)} alt="Post content" />
                      </div>
                    )}

                    <div className={styles.optionsContainer}>
                      <div
                        className={styles.SingleOptionContainer}
                        onClick={async () => {
                          if (likingPosts.has(post._id)) return;

                          const isCurrentlyLiked = likedPosts.has(post._id);

                          try {
                            setLikingPosts((prev) =>
                              new Set(prev).add(post._id)
                            );

                            if (isCurrentlyLiked) {
                              setLikedPosts((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(post._id);
                                return newSet;
                              });
                              await dispatch(
                                decrementLike({ post_id: post._id })
                              );
                            } else {
                              setLikedPosts((prev) =>
                                new Set(prev).add(post._id)
                              );
                              await dispatch(
                                incrementLike({ post_id: post._id })
                              );
                            }

                            await dispatch(getAllPosts());
                          } catch (error) {
                            console.error("Failed to toggle like:", error);

                            if (isCurrentlyLiked) {
                              setLikedPosts((prev) =>
                                new Set(prev).add(post._id)
                              );
                            } else {
                              setLikedPosts((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(post._id);
                                return newSet;
                              });
                            }
                          } finally {
                            setLikingPosts((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(post._id);
                              return newSet;
                            });
                          }
                        }}
                        style={{
                          opacity: likingPosts.has(post._id) ? 0.6 : 1,
                          cursor: likingPosts.has(post._id)
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill={
                            likedPosts.has(post._id) ? "currentColor" : "none"
                          }
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          style={{
                            transition: "all 0.2s ease",
                            color: likedPosts.has(post._id)
                              ? "#ef4444"
                              : "currentColor",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                        <span
                          className={styles.likeCount}
                          style={{
                            color: likedPosts.has(post._id)
                              ? "#ef4444"
                              : "inherit",
                            fontWeight: likedPosts.has(post._id)
                              ? "600"
                              : "400",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {post.likes}
                        </span>
                      </div>

                      <div
                        className={styles.SingleOptionContainer}
                        onClick={async () => {
                          await dispatch(getAllComents({ post_id: post._id }));
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                          />
                        </svg>
                        <span>Comment</span>
                      </div>

                      <div
                        className={styles.SingleOptionContainer}
                        onClick={() => {
                          const text = encodeURIComponent(post.body);
                          const url = encodeURIComponent("ProConnnect.in");
                          window.open(
                            `https://twitter.com/intent/tweet?text=${text}&url=${url}`
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                          />
                        </svg>
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No posts yet.</p>
              )}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div
            className={styles.WorkCommentsContainer}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={styles.AllWorksContainer}
            >
              <h3 style={{ padding: "1rem" }}>Work History</h3>
              <input
                onChange={handleWorkInputData}
                name="company"
                className={styles.inputField}
                placeholder="Enter Company Name"
                type="text"
                value={inputData.company}
              />
              <input
                onChange={handleWorkInputData}
                name="position"
                className={styles.inputField}
                placeholder="Enter Position"
                type="text"
                value={inputData.position}
              />
              <input
                onChange={handleWorkInputData}
                name="years"
                className={styles.inputField}
                placeholder="Years"
                type="number"
                value={inputData.years}
              />
              <button
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    pastWork: [...(userProfile.pastWork || []), inputData],
                  });
                  setInputData({ company: "", position: "", years: "" });
                  setIsModalOpen(false);
                }}
                className={styles.addWorkButton}
              >
                Add Work
              </button>
            </div>
          </div>
        )}

        {postReducer.postId !== "" && (
          <div
            className={styles.CommentsContainer}
            onClick={() => dispatch(resetPostId())}
          >
            <div
              className={styles.allCommentsContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.commentsHeader}>
                <h2>Comments</h2>
                <div
                  className={styles.closeButton}
                  onClick={() => dispatch(resetPostId())}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles.mainUserPostedConatiner}>
                {postReducer.comments.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      marginTop: "2rem",
                    }}
                  >
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  postReducer.comments.map((postComment) => (
                    <div
                      key={postComment._id}
                      className={styles.UserPostedComment_Container}
                    >
                      <div
                        className={styles.UserPostedComment_Profile_Container}
                      >
                        <img
                          className={styles.UserPostedComment_Profile_image}
                          src={getImageUrl(postComment.userId.profilePicture)}
                          alt={postComment.userId.username}
                        />
                      </div>
                      <div
                        className={styles.UserPostedComment_UserDataContainer}
                      >
                        <p className={styles.commentUser}>
                          @{postComment.userId.username}
                        </p>
                        <p className={styles.commentBody}>
                          {postComment.commentBody}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.postCommmentContainer}>
                <input
                  placeholder="Write a comment..."
                  onChange={(e) => setPostComment(e.target.value)}
                  value={postComment}
                />
                <div
                  onClick={async () => {
                    if (!postComment.trim()) return;
                    await dispatch(
                      postOnComment({
                        post_id: postReducer.postId,
                        body: postComment,
                      })
                    );
                    setPostComment("");
                    await dispatch(
                      getAllComents({ post_id: postReducer.postId })
                    );
                  }}
                  className={styles.postCommmentContainer_postBtn}
                >
                  Post
                </div>
              </div>
            </div>
          </div>
        )}
      </DashBoardLayout>
    </UserLayout>
  );
}
