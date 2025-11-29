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
  const [searchQuery, setSearchQuery] = useState("");

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

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://ui-avatars.com/api/?name=User&size=150&background=0D8ABC&color=fff";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";
  };

  const currentUserId =
    authState?.user?.userId?._id ||
    authState?.user?.userId ||
    authState?.user?._id;

  const filteredUsers = authState.all_profiles_fetched
    ? authState.all_users
        .filter((profiles) => profiles.userId._id !== currentUserId)
        .filter((profiles) => {
          if (!searchQuery.trim()) return true;
          return profiles.userId.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        })
    : [];

  if (currentUserId == undefined) {
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

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.discoverContainer}>
          <div className={styles.header}>
            <h1>Discover People</h1>
            <p>Connect with professionals in your network</p>

            <div className={styles.searchContainer}>
              <div className={styles.searchBox}>
                <svg
                  className={styles.searchIcon}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    className={styles.clearBtn}
                    onClick={() => setSearchQuery("")}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4l8 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((profiles) => (
                <div
                  key={profiles._id}
                  className={styles.profileCard}
                  onClick={() => {
                    router.push(`/view_profile/${profiles.userId.username}`);
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.coverBg}></div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.avatarContainer}>
                      <img
                        className={styles.avatar}
                        src={getImageUrl(profiles.userId.profilePicture)}
                        alt={profiles.userId.username}
                      />
                    </div>

                    <div className={styles.userInfo}>
                      <h2 className={styles.userName}>
                        {profiles.userId.username}
                      </h2>
                      <p className={styles.userEmail}>
                        {profiles.userId.email}
                      </p>
                      <div className={styles.bio}>
                        {profiles.bio ||
                          "Bio Is Not Available For This ProConnect User."}
                      </div>
                    </div>

                    <button className={styles.connectBtn}>View Profile</button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noResults}>No users found.</p>
            )}
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
