import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser, getAllUsers } from "@/config/redux/action/postAction";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(getAboutUser({ token }));
  }, []);

  useEffect(() => {
    if (authState?.user) {
      setUserProfile(authState.user);
    }
  }, [authState.user]);

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, []);

  const currentUserId =
    authState?.user?.userId?._id ||
    authState?.user?.userId ||
    authState?.user?._id;

  if (currentUserId == undefined) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <h3>Loading...</h3>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.userCardContainer}>
          <h1 style={{ padding: "0.5rem" }}>Discover People</h1>
          {authState.all_profiles_fetched &&
            authState.all_users
              .filter((profiles) => profiles.userId._id !== currentUserId)
              .map((profiles, index) => (
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
              ))}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
