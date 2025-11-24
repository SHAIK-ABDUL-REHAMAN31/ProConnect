import {
  createPost,
  deletePost,
  getAboutUser,
  getAllComents,
  getAllPosts,
  getAllUsers,
  incrementLike,
  postOnComment,
} from "@/config/redux/action/postAction";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react"; // ✅ Add useRef
import { useDispatch, useSelector } from "react-redux";
import styles from "./dashBoard.module.css";
import DashBoardLayout from "@/layout/dashboardLayout";
import { BASE_URL } from "@/config";
import { resetPostId } from "@/config/redux/reducre/postReducer";

export default function DashBoardComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  // ✅ ADD THIS: Prevent duplicate fetches
  const hasFetchedData = useRef(false);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();
  const [postComment, setPostComment] = useState("");

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://ui-avatars.com/api/?name=User&size=150&background=0D8ABC&color=fff";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${BASE_URL}/${imagePath}`;
  };

  useEffect(() => {
    if (hasFetchedData.current) {
      console.log("⏭️ Skipping duplicate fetch");
      return;
    }

    console.log("🚀 Initial data fetch");

    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    let savedUser = null;

    if (userString) {
      try {
        savedUser = JSON.parse(userString);
      } catch (e) {
        localStorage.removeItem("user");
      }
    }

    if (savedUser && !authState.user) {
      dispatch({ type: "SET_USER", payload: savedUser });
    }

    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getAllPosts());
      dispatch(getAllUsers());
      hasFetchedData.current = true;
      console.log("✅ Data fetched, flag set");
    }
  }, []);

  const handleUpload = async () => {
    await dispatch(createPost({ media: fileContent, body: postContent }));
    console.log("file :", fileContent, "body:", postContent);
    setPostContent("");
    setFileContent(null);
    await dispatch(getAllPosts());
  };

  if (authState.user) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div className={styles.scrollComponent}>
            <div className={styles.wrapper}>
              {/* Create Post Card */}
              <div className={styles.CreatePostConatiner}>
                <div className={styles.createPostHeader}>
                  <img
                    className={styles.CreatePostConatiner_image}
                    src={getImageUrl(authState.user.userId.profilePicture)}
                    alt="Profile"
                  />
                  <textarea
                    onChange={(e) => setPostContent(e.target.value)}
                    value={postContent}
                    name="fileUpload"
                    placeholder="What's on your mind?"
                    className={styles.textAreaOfContent}
                  ></textarea>
                </div>

                <div className={styles.createPostActions}>
                  <label htmlFor="fileUpload" className={styles.actionButton}>
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
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    <span>Photo</span>
                  </label>
                  <input
                    name="media"
                    onChange={(e) => setFileContent(e.target.files[0])}
                    hidden
                    type="file"
                    id="fileUpload"
                  />

                  <button
                    onClick={handleUpload}
                    className={styles.postButton}
                    disabled={!postContent.trim() && !fileContent}
                  >
                    <span>Post</span>
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
                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Posts Feed */}
              <div className={styles.PostsContainer}>
                {postState.posts.map((post) => {
                  return (
                    <div key={post._id} className={styles.singlecard}>
                      <div className={styles.singlecard_profileContainer}>
                        <img
                          onClick={() =>
                            router.push(`/view_profile/${post.userId.username}`)
                          }
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
                          <img
                            src={getImageUrl(post.media)}
                            alt="Post content"
                          />
                        </div>
                      )}

                      <div className={styles.optionsContainer}>
                        <div
                          className={styles.SingleOptionContainer}
                          onClick={async () => {
                            await dispatch(
                              incrementLike({ post_id: post._id })
                            );
                            await dispatch(getAllPosts());
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill={post.likes > 0 ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            />
                          </svg>
                          <span className={styles.likeCount}>{post.likes}</span>
                        </div>

                        <div
                          className={styles.SingleOptionContainer}
                          onClick={async () => {
                            await dispatch(
                              getAllComents({ post_id: post._id })
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
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comments Modal */}
          {postState.postId !== "" && (
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
                  {postState.comments.length === 0 ? (
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
                    postState.comments.map((postComment) => (
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
                          post_id: postState.postId,
                          body: postComment,
                        })
                      );
                      setPostComment("");
                      await dispatch(
                        getAllComents({ post_id: postState.postId })
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
  } else {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <p>Loading...</p>
          </div>
        </DashBoardLayout>
      </UserLayout>
    );
  }
}
