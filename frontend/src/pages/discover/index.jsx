import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/postAction";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function DiscoverPage() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, []);

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.userCardContainer}>
          <h1 style={{ padding: "0.5rem" }}>Discover People </h1>
          {authState.all_profiles_fetched &&
            authState.all_users.map((profiles, index) => {
              return (
                <div
                  onClick={() => {
                    router.push(`/view_profile/${profiles.userId.username}`);
                  }}
                  key={profiles._id}
                  className={styles.userCard}
                >
                  <img
                    className={styles.userCard_img}
                    src={`${BASE_URL}/${profiles.userId.profilePicture}`}
                  />
                  <div className={styles.userCardDetails}>
                    <h2>{profiles.userId.username}</h2>
                    <p>{profiles.userId.email}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
