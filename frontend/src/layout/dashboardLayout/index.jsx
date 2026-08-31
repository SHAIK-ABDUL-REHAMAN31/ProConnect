import React, { useEffect, useState } from "react";
import styles from "./dashLayout.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setIsTokenThere } from "@/config/redux/reducre/userReducer";
import { getAllPosts, getAllUsers, getAboutUser } from "@/config/redux/action/postAction";

export default function DashBoardLayout({ children, requireAuth = false }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(new Set());
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userString = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (requireAuth && !token) {
      router.push("/login");
      return;
    }

    if (token) {
      dispatch(setIsTokenThere());
      if (userString && !authState.user) {
        try {
          const parsed = JSON.parse(userString);
          dispatch({ type: "SET_USER", payload: parsed });
        } catch (e) {
          localStorage.removeItem("user");
        }
      }
      dispatch(getAboutUser({ token }));
    }

    dispatch(getAllPosts());
    dispatch(getAllUsers());
  }, [requireAuth]);

  const isLoggedIn =
    mounted &&
    (Boolean(authState?.user) ||
      (typeof window !== "undefined" && Boolean(localStorage.getItem("token"))));

  const handleProtectedAction = (callback) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (callback) callback();
  };

  const handleConnectToggle = (id) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setConnectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const navMenuItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "network",
      label: "My Network",
      path: "/myConnections",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "jobs",
      label: "Jobs",
      path: "/jobs",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      id: "groups",
      label: "Groups",
      path: "/communities",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 21a8 8 0 0 0-16 0" />
          <circle cx="10" cy="8" r="5" />
          <path d="M22 20c0-3.37-2-6.5-5-7.5" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "courses",
      label: "Courses",
      path: "/learning",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      id: "events",
      label: "Events",
      path: "/events",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: "saved",
      label: "Saved",
      path: "/saved",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "code-collab",
      label: "Code Collab",
      path: "/code-collab",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
  ];

  // Filter real backend users (excluding currently logged in user)
  const loggedInUserId = (authState?.user?.userId?._id || authState?.user?._id)?.toString();
  const rawUsers = Array.isArray(authState.all_users) ? authState.all_users : [];
  const filteredUsers = rawUsers
    .filter((p) => {
      const pId = (p?.userId?._id || p?._id || p?.userId)?.toString();
      return pId && pId !== loggedInUserId && p?.userId?.name;
    })
    .map((p) => ({
      id: p._id || p.userId?._id,
      name: p?.userId?.name,
      role: p?.bio || `@${p?.userId?.username || "user"}`,
      avatar:
        p?.userId?.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.userId?.name || "User")}&background=0a66c2&color=fff&bold=true`,
      username: p?.userId?.username,
    }));

  // Recommended Courses matching the screenshot
  const recommendedCourses = [
    {
      id: "c1",
      title: "Full Stack Web Development",
      author: "By CodingAcademy",
      rating: "4.8",
      reviews: "2.3k",
      color: "linear-gradient(135deg, #0a66c2, #38bdf8)",
      icon: "💻",
    },
    {
      id: "c2",
      title: "Data Science with Python",
      author: "By DataCamp",
      rating: "4.7",
      reviews: "1.8k",
      color: "linear-gradient(135deg, #0284c7, #06b6d4)",
      icon: "🐍",
    },
    {
      id: "c3",
      title: "System Design Interview Prep",
      author: "By Educative",
      rating: "4.9",
      reviews: "3.1k",
      color: "linear-gradient(135deg, #2563eb, #6366f1)",
      icon: "⚡",
    },
  ];

  // Upcoming Events matching the screenshot
  const upcomingEvents = [
    {
      id: "e1",
      title: "Web Development Bootcamp",
      meta: "May 24, 2025 · Online",
      color: "linear-gradient(135deg, #0a66c2, #60a5fa)",
      icon: "🌐",
    },
    {
      id: "e2",
      title: "AI & Future of Work",
      meta: "May 28, 2025 · Bangalore",
      color: "linear-gradient(135deg, #1d4ed8, #38bdf8)",
      icon: "🤖",
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutGrid}>
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className={styles.leftSidebar}>
          {/* Navigation Links */}
          <nav className={styles.navMenu}>
            {navMenuItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? router.pathname === "/" || router.pathname === "/dashboard"
                  : router.pathname === item.path;

              return (
                <div
                  key={item.id}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  onClick={() => {
                    if (item.path === "/" || !requireAuth) {
                      router.push(item.path);
                    } else {
                      handleProtectedAction(() => router.push(item.path));
                    }
                  }}
                >
                  <span className={styles.navItemIcon}>{item.icon}</span>
                  <span className={styles.navItemLabel}>{item.label}</span>
                </div>
              );
            })}
          </nav>

          {/* Create Post Button */}
          <button
            className={styles.createPostBtn}
            onClick={() => {
              if (!isLoggedIn) {
                router.push("/login");
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
                const composerInput = document.getElementById("mainPostComposer");
                if (composerInput) composerInput.focus();
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Create Post</span>
          </button>

          {/* Upgrade to Pro Card */}
          <div className={styles.proCard}>
            <div className={styles.proHeader}>
              <div className={styles.proIconBadge}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h4 className={styles.proTitle}>Upgrade to Pro</h4>
            </div>
            <p className={styles.proSubtitle}>
              Unlock premium courses, insights and more.
            </p>
            <button
              className={styles.proUpgradeBtn}
              onClick={() => setShowProModal(true)}
            >
              Upgrade Now
            </button>
          </div>

          {/* Left Footer Links */}
          <footer className={styles.sidebarFooter}>
            <div className={styles.footerLinks}>
              <a href="#">Help</a>
              <span>·</span>
              <a href="#">Privacy</a>
              <span>·</span>
              <a href="#">Terms</a>
              <span>·</span>
              <a href="#">About</a>
            </div>
            <div className={styles.footerMore}>
              <span>More ▾</span>
            </div>
            <p className={styles.copyright}>© 2025 proConnect</p>
          </footer>
        </aside>

        {/* ================= CENTER FEED ================= */}
        <main className={styles.mainFeed}>{children}</main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className={styles.rightSidebar}>
          {/* Widget 1: People You May Know */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <h3 className={styles.widgetTitle}>People You May Know</h3>
              <button
                className={styles.seeAllLink}
                onClick={() => router.push("/myConnections")}
              >
                See all
              </button>
            </div>

            <div className={styles.peopleList}>
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, 5).map((person) => {
                  const isConnected = connectedUsers.has(person.id);
                  return (
                    <div key={person.id} className={styles.personRow}>
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className={styles.personAvatar}
                        onClick={() => {
                          if (person.username) {
                            router.push(`/view_profile/${person.username}`);
                          }
                        }}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || "User")}&background=0a66c2&color=fff&bold=true`;
                        }}
                      />
                      <div className={styles.personInfo}>
                        <span
                          className={styles.personName}
                          onClick={() => {
                            if (person.username) {
                              router.push(`/view_profile/${person.username}`);
                            }
                          }}
                        >
                          {person.name}
                        </span>
                        <span className={styles.personRole}>{person.role}</span>
                      </div>
                      <button
                        className={`${styles.connectBtn} ${isConnected ? styles.connectedBtn : ""}`}
                        onClick={() => handleConnectToggle(person.id)}
                      >
                        {isConnected ? "Pending" : "Connect"}
                      </button>
                    </div>
                  );
                })
              ) : (
                /* Smooth Skeleton Shimmer rows while users arrive */
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.skeletonPersonRow}>
                      <div className={`${styles.skeletonPersonAvatar} ${styles.skeletonShimmer}`}></div>
                      <div className={styles.skeletonPersonMeta}>
                        <div className={`${styles.skeletonPersonName} ${styles.skeletonShimmer}`}></div>
                        <div className={`${styles.skeletonPersonRole} ${styles.skeletonShimmer}`}></div>
                      </div>
                      <div className={`${styles.skeletonPersonBtn} ${styles.skeletonShimmer}`}></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Widget 2: Recommended Courses */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <h3 className={styles.widgetTitle}>Recommended Courses</h3>
              <button
                className={styles.seeAllLink}
                onClick={() => router.push("/learning")}
              >
                See all
              </button>
            </div>

            <div className={styles.coursesList}>
              {recommendedCourses.map((course) => (
                <div
                  key={course.id}
                  className={styles.courseRow}
                  onClick={() => router.push("/learning")}
                >
                  <div
                    className={styles.courseThumbnail}
                    style={{ background: course.color }}
                  >
                    <span>{course.icon}</span>
                  </div>
                  <div className={styles.courseDetails}>
                    <h4 className={styles.courseName}>{course.title}</h4>
                    <span className={styles.courseAuthor}>{course.author}</span>
                    <div className={styles.courseRatingRow}>
                      <span className={styles.ratingNumber}>{course.rating}</span>
                      <span className={styles.starIcon}>★</span>
                      <span className={styles.reviewCount}>({course.reviews})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Upcoming Events */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <h3 className={styles.widgetTitle}>Upcoming Events</h3>
              <button
                className={styles.seeAllLink}
                onClick={() => router.push("/events")}
              >
                See all
              </button>
            </div>

            <div className={styles.eventsList}>
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={styles.eventRow}
                  onClick={() => router.push("/events")}
                >
                  <div
                    className={styles.eventThumbnail}
                    style={{ background: ev.color }}
                  >
                    <span>{ev.icon}</span>
                  </div>
                  <div className={styles.eventDetails}>
                    <h4 className={styles.eventTitle}>{ev.title}</h4>
                    <span className={styles.eventMeta}>{ev.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Pro Modal */}
      {showProModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowProModal(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>👑 ProConnect Premium</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowProModal(false)}
              >
                ✕
              </button>
            </div>
            <p className={styles.modalDesc}>
              Unlock unlimited AI Career Coach sessions, 500+ premium tech courses, priority recruiter search visibility, and exclusive networking events.
            </p>
            <div className={styles.modalPerks}>
              <div>✨ Unlimited AI Resume Analyzer & Mock Interviews</div>
              <div>⚡ Direct inMail messaging to verified hiring managers</div>
              <div>🎓 Free verified certification for all course tracks</div>
            </div>
            <button
              className={styles.modalCta}
              onClick={() => {
                setShowProModal(false);
                router.push("/learning");
              }}
            >
              Get Pro Membership ($9.99/mo)
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNavBar}>
        <div
          onClick={() => router.push("/")}
          className={`${styles.mobileNavItem} ${
            router.pathname === "/" ? styles.mobileActive : ""
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span>Home</span>
        </div>

        <div
          onClick={() => router.push("/myConnections")}
          className={`${styles.mobileNavItem} ${
            router.pathname === "/myConnections" ? styles.mobileActive : ""
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <span>Network</span>
        </div>

        <div
          onClick={() => router.push("/jobs")}
          className={`${styles.mobileNavItem} ${
            router.pathname === "/jobs" ? styles.mobileActive : ""
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          </svg>
          <span>Jobs</span>
        </div>

        <div
          onClick={() => router.push("/learning")}
          className={`${styles.mobileNavItem} ${
            router.pathname === "/learning" ? styles.mobileActive : ""
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Courses</span>
        </div>

        <div
          onClick={() => router.push(isLoggedIn ? "/profile" : "/login")}
          className={`${styles.mobileNavItem} ${
            router.pathname === "/profile" ? styles.mobileActive : ""
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{isLoggedIn ? "Profile" : "Log In"}</span>
        </div>
      </nav>
    </div>
  );
}
