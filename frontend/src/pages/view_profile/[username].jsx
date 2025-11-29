import { BASE_URL, clientServer } from "@/config";
import styles from "./index.module.css";
import DashBoardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionPending, setIsConnectionPending] = useState(false);

  const user = userProfile?.userId;

  if (!userProfile || !user) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>User profile not found </h2>
          </div>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  useEffect(() => {
    const postList = postReducer.posts.filter(
      (post) => post.userId.username === router.query.username
    );
    setUserPosts(postList);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    let foundConnection = authState.connections?.find(
      (item) => item.connectionId._id === user?._id
    );

    if (foundConnection) {
      setIsCurrentUserInConnection(true);
      setIsConnectionPending(!foundConnection.status_accepted);
      return;
    }

    foundConnection = authState.connectionRequests?.connections?.find(
      (req) => req.userId._id === user?._id
    );

    if (foundConnection) {
      setIsCurrentUserInConnection(true);
      setIsConnectionPending(!foundConnection.status_accepted);
    }
  }, [authState.connections, authState.connectionRequests, user?._id]);

  const fetchUserRelatedData = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );

    const token = localStorage.getItem("token");
    await dispatch(getMyConnectionsRequest(token));
  };

  useEffect(() => {
    fetchUserRelatedData();
  }, []);

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
            <img
              className={styles.profile_picture}
              src={getImageUrl(user?.profilePicture)}
              alt="Profile"
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <div style={{ flex: "0.8" }}>
                <div style={{ display: "flex", gap: "1.2rem" }}>
                  <h2>{user.name}</h2>
                  <p>@{user.username}</p>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  {isCurrentUserInConnection ? (
                    <button className={styles.ConnectedButton}>
                      {isConnectionPending ? "Pending..." : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            connectionId: user._id,
                          })
                        );

                        setIsCurrentUserInConnection(true);
                        setIsConnectionPending(true);
                      }}
                      className={styles.ConnectionButton}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      const response = await clientServer.get(
                        `/user/download_profile?id=${user._id}`
                      );
                      window.open(
                        `${BASE_URL}/uploads/${response.data.message}`,
                        "_blank"
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      style={{ width: "1.2em" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>{userProfile.bio}</div>
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

          <div className={styles.WorkHistory}>
            <h4 className={styles.heading}>Work History</h4>
            <div className={styles.WorkHistoryContainer}>
              {userProfile.pastWork.length > 0 ? (
                userProfile.pastWork.map((work, index) => (
                  <div key={index} className={styles.WorkHistoryCard}>
                    <div className={styles.cardHeader}>
                      <h5>{work.company}</h5>
                      <span className={styles.years}>{work.years} yrs</span>
                    </div>
                    <p className={styles.position}>{work.position}</p>
                  </div>
                ))
              ) : (
                <p>No past work information available.</p>
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
    console.log(" getServerSideProps received username:", username);

    const response = await clientServer.get(
      "/user/get_userProfile_basedOn_username",
      { params: { username } }
    );

    console.log(" API response:", response.data);

    return { props: { userProfile: response.data.userProfile } };
  } catch (error) {
    console.error(" SSR Error:", error.response?.data || error.message);
    return { props: { userProfile: null, error: "User not found" } };
  }
}
