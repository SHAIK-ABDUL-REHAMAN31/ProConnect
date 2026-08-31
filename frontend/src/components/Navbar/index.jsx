import React, { useState, useEffect, useRef } from "react";
import styles from "./navStyles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducre/userReducer";
import { useSocket } from "@/context/SocketContext";

export default function NavbarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { notifications } = useSocket();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cachedUser, setCachedUser] = useState(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setCachedUser(parsed);
      } catch (e) {}
    }

    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    dispatch(reset());
    router.push("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isLoggedIn =
    mounted &&
    (Boolean(authState?.user) ||
      Boolean(cachedUser) ||
      (typeof window !== "undefined" && Boolean(localStorage.getItem("token"))));

  const activeUser = authState?.user || cachedUser;

  // Profile is "ready" only when we have a real user name (not just a token)
  const profileReady = Boolean(
    activeUser?.userId?.name || activeUser?.name
  );

  const userName =
    activeUser?.userId?.name ||
    activeUser?.name ||
    "";

  const userUsername =
    activeUser?.userId?.username || activeUser?.username
      ? `@${activeUser?.userId?.username || activeUser?.username}`
      : profileReady
      ? "@member"
      : "";

  const userAvatar =
    activeUser?.userId?.profilePicture ||
    activeUser?.profilePicture ||
    (profileReady
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=0a66c2&color=fff&bold=true`
      : "");

  const userHeadline =
    activeUser?.userId?.headline ||
    activeUser?.headline ||
    activeUser?.userId?.bio ||
    activeUser?.bio ||
    (profileReady ? "Member at ProConnect" : "");

  return (
    <header className={styles.navbarWrapper}>
      <div className={styles.navbarContent}>
        {/* Left: Brand Logo */}
        <div className={styles.brand} onClick={() => router.push("/")}>
          <span className={styles.brandPro}>pro</span>
          <span className={styles.brandConnect}>Connect</span>
        </div>

        {/* Center: Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for people, courses, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <button
            className={styles.searchIconBtn}
            onClick={() => {
              if (searchQuery.trim()) {
                router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Right: Actions & User Profile */}
        <div className={styles.rightActions}>
          {/* Notifications Icon */}
          <button
            className={styles.iconButton}
            onClick={() => router.push("/notifications")}
            aria-label="Notifications"
            title="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifications && notifications.length > 0 && (
              <span className={styles.badgeDot}></span>
            )}
          </button>

          {/* Messages Icon */}
          <button
            className={styles.iconButton}
            onClick={() => router.push("/messages")}
            aria-label="Messages"
            title="Messages"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          {/* Profile Dropdown Pill */}
          <div className={styles.profileDropdownWrapper} ref={profileMenuRef}>
            <div
              className={styles.profilePill}
              onClick={() => {
                if (isLoggedIn) {
                  setShowProfileMenu(!showProfileMenu);
                } else {
                  router.push("/login");
                }
              }}
            >
              <img
                src={
                  userAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=0a66c2&color=fff&bold=true`
                }
                alt={userName || "Profile"}
                className={styles.profileAvatar}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=0a66c2&color=fff&bold=true`;
                }}
              />
              <div className={styles.profileDetails}>
                <span className={styles.profileName}>
                  {userName || (isLoggedIn ? "Member" : "Sign In")}
                </span>
                <span className={styles.profileRole}>
                  {userUsername || (isLoggedIn ? "@member" : "Welcome")}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${styles.chevronIcon} ${showProfileMenu ? styles.chevronOpen : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className={styles.dropdownMenu}>
                <div
                  className={styles.dropdownHeader}
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push(isLoggedIn ? "/profile" : "/login");
                  }}
                >
                  <img
                    src={userAvatar}
                    alt={userName}
                    className={styles.dropdownAvatar}
                  />
                  <div className={styles.dropdownUserInfo}>
                    <strong>{userName}</strong>
                    <span>{userHeadline}</span>
                  </div>
                </div>

                <div className={styles.dropdownDivider}></div>

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push(isLoggedIn ? "/profile" : "/login");
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>View Full Profile</span>
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/settings");
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Account Settings</span>
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/learning");
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  <span>My Learning & Courses</span>
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/saved");
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Saved Items</span>
                </button>

                <div className={styles.dropdownDivider}></div>

                {isLoggedIn ? (
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownLogin}`}
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/login");
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
