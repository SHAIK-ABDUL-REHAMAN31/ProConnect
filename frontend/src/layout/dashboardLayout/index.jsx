import React, { useEffect } from "react";
import styles from "./dashLayout.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setIsTokenThere } from "@/config/redux/reducre/authReducer";
import { BASE_URL } from "@/config";

export default function DashBoardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem("token") == null) {
      router.push("/login");
    }
    dispatch(setIsTokenThere());
  }, []);

  return (
    <div className="container">
      <div className={styles.homeContainer}>
        <div className={styles.homeContainer_leftBar}>
          <div
            onClick={() => router.push("/dashboard")}
            className={styles.sidebarOption}
          >
            <svg
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
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <p>Home</p>
          </div>
          <div
            onClick={() => router.push("/discover")}
            className={styles.sidebarOption}
          >
            <svg
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>

            <p>Discover</p>
          </div>
          <div
            onClick={() => router.push("/myConnections")}
            className={styles.sidebarOption}
          >
            <svg
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>

            <p>My Connections</p>
          </div>
        </div>
        <div className={styles.homeContainer_feedContainer}>{children}</div>
        <div className={styles.homeContainer_extraContainer}>
          <h3>Top profiles</h3>
          {authState.all_profiles_fetched &&
            (authState.all_users.map((profile) => (
              <div key={profile._id} className={styles.extraContainer}>
                <img src={`${BASE_URL}/${profile.userId.profilePicture}`} />
                <div style={{ textAlign: "start" }}>
                  <p>@{profile.userId?.username || "Unknown User"}</p>
                  <p>{profile.userId?.name || "Unknown User"}</p>
                </div>
              </div>
            )) || <p>No users found</p>)}
        </div>
      </div>
      <div className={styles.mobileNavBar}>
        <div
          onClick={() => router.push("/dashboard")}
          className={styles.singleNavItemHolder}
        >
          <svg
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
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          <p>Home</p>
        </div>

        <div
          onClick={() => router.push("/discover")}
          className={styles.singleNavItemHolder}
        >
          <svg
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
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <p>Discover</p>
        </div>

        <div
          onClick={() => router.push("/myConnections")}
          className={styles.singleNavItemHolder}
        >
          <svg
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
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <p>Connections</p>
        </div>
      </div>
    </div>
  );
}
