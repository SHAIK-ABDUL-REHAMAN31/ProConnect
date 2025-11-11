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
import { connection } from "next/server";
export default function MyConnectionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyConnectionsRequest({ token: localStorage.getItem("token") }));
  }, []);

  useEffect(() => {
    if (authState.connectionRequests.length != 0) {
      console.log(
        "authStateConnectionRequests ==========",
        authState.connectionRequests.connections
      );
    }
  }, [authState.connectionRequests]);

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.usercardContainer}>
          <h1 style={{ padding: "0.5rem" }}>My Connections</h1>
          {authState.connectionRequests.length != 0 &&
            authState.connectionRequests.connections
              .filter((connection) => connection.status_accepted == null)
              .map((user, index) => {
                return (
                  <div
                    onClick={() => {
                      router.push(`/view_profile/${user.userId.username}`);
                    }}
                    className={styles.userCard}
                    key={index}
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
                        src={`${BASE_URL}/${user.userId.profilePicture}`}
                        alt="/"
                      />
                      <div className={styles.userInfo}>
                        <h2>{user.userId.name}</h2>
                        <p>@{user.userId.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          acceptConnection({
                            connectionId: user._id,
                            token: localStorage.getItem("token"),
                            action_type: "accept",
                          })
                        );
                      }}
                      className={styles.acceptButton}
                    >
                      Accept
                    </button>
                  </div>
                );
              })}
          <h4 style={{ padding: "0.5rem" }}>My Network</h4>

          {authState.connectionRequests?.connections
            ?.filter((connection) => connection.status_accepted === true)
            .map((user, index) => (
              <div
                onClick={() => {
                  router.push(`/view_profile/${user.userId.username}`);
                }}
                className={styles.userCard}
                key={index}
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
                    src={`${BASE_URL}/${user.userId.profilePicture}`}
                    alt="/"
                  />
                  <div className={styles.userInfo}>
                    <h2>{user.userId.name}</h2>
                    <p>@{user.userId.username}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
