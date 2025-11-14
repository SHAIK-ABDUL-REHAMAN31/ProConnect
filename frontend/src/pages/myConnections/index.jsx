import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptConnection,
  getMyConnectionsRequest,
} from "@/config/redux/action/authAction";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const loggedInUserId = authState.user?._id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(getMyConnectionsRequest(token));
  }, []);

  const connections = authState.connectionRequests || [];
  console.log(authState.connectionRequests);

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.usercardContainer}>
          <h1 style={{ padding: "0.5rem" }}>My Connections</h1>

          {/* Pending Requests */}
          {connections
            .filter((c) => c.status_accepted == null)
            .map((req, i) => (
              <div
                key={i}
                className={styles.userCard}
                onClick={() =>
                  router.push(`/view_profile/${req.userId.username}`)
                }
              >
                <div
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    alignItems: "center",
                  }}
                >
                  <img
                    className={styles.userProfilePic}
                    src={`${BASE_URL}/${req.userId.profilePicture}`}
                    alt="/"
                  />
                  <div className={styles.userInfo}>
                    <h2>{req.userId.name}</h2>
                    <p>@{req.userId.username}</p>
                  </div>
                </div>

                <button
                  className={styles.acceptButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(
                      acceptConnection({
                        connectionId: req._id,
                        token: localStorage.getItem("token"),
                        action_type: "accept",
                      })
                    );
                  }}
                >
                  Accept
                </button>
              </div>
            ))}

          {/* Accepted Connections */}
          <h4 style={{ padding: "0.5rem" }}>My Network</h4>

          {connections
            .filter((c) => c.status_accepted === true)
            .map((c, i) => {
              const otherUser =
                c.userId._id === loggedInUserId ? c.connectionId : c.userId;

              return (
                <div
                  key={i}
                  className={styles.userCard}
                  onClick={() =>
                    router.push(`/view_profile/${otherUser.username}`)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1.2rem",
                      alignItems: "center",
                    }}
                  >
                    <img
                      className={styles.userProfilePic}
                      src={`${BASE_URL}/${otherUser.profilePicture}`}
                      alt={otherUser.name}
                    />
                    <div className={styles.userInfo}>
                      <h2>{otherUser.name}</h2>
                      <p>@{otherUser.username}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
