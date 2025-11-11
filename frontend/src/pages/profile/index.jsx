import {
  deletePost,
  getAboutUser,
  getAllPosts,
} from "@/config/redux/action/postAction";
import DashBoardLayout from "@/layout/dashboardLayout";
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
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleWorkInputData = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(getAboutUser({ token }));
    dispatch(getAllPosts({ token }));
  }, [dispatch]);

  useEffect(() => {
    if (authState?.user) {
      console.log(" User profile fetched:", authState.user);
      setUserProfile(authState.user);
    } else {
      console.log(" authState.user not yet available:", authState.user);
    }

    if (authState.user) {
      let post = postReducer.posts.filter((post) => {
        return post.userId.username === authState.user.userId.username;
      });
      console.log("posts from useEffect : ", post);
      setUserPosts(post);
    }
  }, [authState.user, postReducer.posts]);

  //userPosts
  useEffect(() => {}, [postReducer.posts]);

  //loading

  if (!userProfile) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div style={{ padding: "2rem" }}>Loading profile...</div>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  const { userId, bio, pastWork } = userProfile;

  const updateUserProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const respone = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateUserProfileData = async () => {
    const request = await clientServer.post("/update_user_profile", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });

    const respone = await clientServer.post("/update_user_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <label
              htmlFor="profilePictureUpload"
              className={styles.backDropContainer_profilOverLay}
            >
              <p>Edit</p>
            </label>
            <input
              onChange={(e) => {
                updateUserProfilePicture(e.target.files[0]);
              }}
              type="file"
              id="profilePictureUpload"
              hidden
            />
            <img
              className={styles.profile_picture}
              src={`${BASE_URL}/${userId?.profilePicture}`}
              alt="Profile"
            />
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
                    value={userId?.name}
                  />
                  <p>@{userId?.username}</p>
                </div>
                <div>
                  <textarea
                    value={bio}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, bio: e.target.value });
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    maxLength={220}
                    placeholder="Write something about yourself..."
                  />
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      textAlign: "left",
                    }}
                  >
                    {bio.length}/220
                  </p>
                </div>
              </div>

              <div
                className={styles.profileRecentActivity}
                style={{ flex: "0.2" }}
              >
                <h3>Recent Activity</h3>

                {userPosts?.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.postCard_profileContainer}>
                          {post.media ? (
                            <img src={`${BASE_URL}/${post.media}`} alt="Post" />
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No posts yet.</p>
                )}
              </div>
            </div>
          </div>

          {userProfile != authState.user && (
            <div
              onClick={(e) => {
                updateUserProfileData();
              }}
            >
              <button className={styles.acceptButton}>Update Profile</button>
            </div>
          )}
          {/* <button
                className={styles.AddWorkButton}
                onClick={() => setIsModalOpen(true)}
              >
                Add Your Work
              </button> */}

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
                      <div className={styles.singlecardImage}>
                        <h3>@{post.userId.username}</h3>
                        <div className={styles.body_deletebtn}>
                          <p>{post.body}</p>
                          {post.userId._id === authState.user.userId._id && (
                            <div
                              className={styles.deleteBtn}
                              onClick={async () => {
                                await dispatch(
                                  deletePost({ post_id: post._id })
                                );
                                await dispatch(getAllPosts());
                              }}
                            >
                              <svg
                                style={{
                                  height: "1.4em",
                                  color: "red",
                                  cursor: "pointer",
                                }}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={styles.icon}
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
                        {post.media ? (
                          <img src={`${BASE_URL}/${post.media}`} alt="Post" />
                        ) : (
                          <div
                            style={{ width: "3.4rem", height: "3.4rem" }}
                          ></div>
                        )}
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
            className={styles.CommentsContainer}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={styles.allCommentsContainer}
            >
              <h3 style={{ padding: "1rem" }}>Work History</h3>
              <input
                onChange={handleWorkInputData}
                name="company"
                className={styles.inputField}
                placeholder="Enter Company Name"
                type="text"
              />
              <input
                onChange={handleWorkInputData}
                name="position"
                className={styles.inputField}
                placeholder="Enter Position"
                type="text"
              />
              <input
                onChange={handleWorkInputData}
                name="years"
                className={styles.inputField}
                placeholder="Years"
                type="number"
              />
              <button
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    pastWork: [...userProfile.pastWork, inputData],
                  });
                  setIsModalOpen(false);
                }}
                className={styles.postCommmentContainer_postBtn}
              >
                Add Work
              </button>
            </div>
          </div>
        )}
      </DashBoardLayout>
    </UserLayout>
  );
}
