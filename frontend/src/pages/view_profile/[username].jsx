import { BASE_URL, clientServer } from "@/config";
import styles from "./index.module.css";
import DashBoardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage(userProfile) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [IsCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  console.log("userposts:", userPosts);

  console.log("posts From post Reducer :", postReducer.posts[0]);

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    console.log("posts from useEffect : ", post);

    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    console.log(
      "view Profile useEffect----------",
      authState.connectionRequests
    );

    const inConnections = authState.connections?.some(
      (user) => user.connectionId._id === userProfile?.userProfile?.userId?._id
    );

    if (inConnections) {
      setIsCurrentUserInConnection(true);
      const acceptedConnection = authState.connections?.find(
        (user) =>
          user.connectionId._id === userProfile?.userProfile?.userId?._id
      );
      if (acceptedConnection?.status_accepted === true) {
        setIsConnectionNull(false);
      }
    }

    const inRequests = authState.connectionRequests?.connections?.some(
      (user) => user.userId._id === userProfile?.userId?._id
    );

    if (inRequests) {
      setIsCurrentUserInConnection(true);
      const requestConnection = authState.connectionRequests?.connections?.find(
        (user) => user.userId._id === userProfile?.userId?._id
      );
      if (requestConnection?.status_accepted === true) {
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections, authState.connectionRequests]);

  const getUserPosts = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
    await dispatch(
      getMyConnectionsRequest({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    getUserPosts();
  }, []);
  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.profile_picture}
              src={`${BASE_URL}/${userProfile.userProfile.userId.profilePicture}`}
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
                  <h2>{userProfile.userProfile.userId.name}</h2>
                  <p>@{userProfile.userProfile.userId.username}</p>
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  {IsCurrentUserInConnection ? (
                    <button className={styles.ConnectedButton}>
                      {isConnectionNull ? "Pending..." : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userProfile.userId._id,
                          })
                        );
                      }}
                      className={styles.ConnectionButton}
                    >
                      Connect
                    </button>
                  )}
                  <div
                    onClick={async () => {
                      const response = await clientServer.get(
                        `/user/download_profile?id=${userProfile.userProfile.userId._id}`
                      );
                      window.open(
                        `${BASE_URL}/${response.data.message}`,
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
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>{userProfile.userProfile.bio}</div>
              </div>

              <div className={styles.recentActivity} style={{ flex: "0.2" }}>
                <h3>Recent Activity</h3>

                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.postCard_profileContainer}>
                          {post.media !== "" ? (
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              alt="Post Image"
                            />
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.WorkHistory}>
            <h4 className={styles.heading}>Work History</h4>
            <div className={styles.WorkHistoryContainer}>
              {userProfile.userProfile.pastWork.map((work, index) => (
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
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  console.log("From Serrverside:", context.query.username);

  const req = await clientServer.get("/user/get_userProfile_basedOn_username", {
    params: {
      username: context.query.username,
    },
  });
  const response = await req.data;

  console.log(response);

  return { props: { userProfile: req.data.userProfile } };
}
