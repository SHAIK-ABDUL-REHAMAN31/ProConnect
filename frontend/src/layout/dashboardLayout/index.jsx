import React, { useEffect, useState } from "react";
import styles from "./dashLayout.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setIsTokenThere } from "@/config/redux/reducre/authReducer";
import { BASE_URL } from "@/config";
import { getAllPosts, getAllUsers } from "@/config/redux/action/postAction";

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

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getAllPosts());
      await dispatch(getAllUsers());
    };

    fetchData();
  }, []);

  const loggedInUserId = authState?.user?._id;

  const filteredUsers =
    authState.all_users?.filter((profile) => {
      return profile?.userId?._id !== loggedInUserId;
    }) || [];

  const randomUsers = [...filteredUsers]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  //extra conatiner details

  const [interestedEvents, setInterestedEvents] = useState(new Set());

  const trendingTopics = [
    { id: 1, hashtag: "#WebDevelopment", posts: 1243 },
    { id: 2, hashtag: "#ReactJS", posts: 892 },
    { id: 3, hashtag: "#AI", posts: 756 },
    { id: 4, hashtag: "#CloudComputing", posts: 634 },
    { id: 5, hashtag: "#DevOps", posts: 521 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      date: "Dec 15, 2025",
      time: "10:00 AM",
      location: "Online",
      attendees: 234,
    },
    {
      id: 2,
      title: "React Workshop",
      date: "Dec 20, 2025",
      time: "2:00 PM",
      location: "New York, NY",
      attendees: 89,
    },
    {
      id: 3,
      title: "Networking Meetup",
      date: "Jan 5, 2026",
      time: "6:00 PM",
      location: "San Francisco, CA",
      attendees: 156,
    },
  ];

  const toggleInterest = (eventId) => {
    setInterestedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleTopicClick = (hashtag) => {
    console.log("Clicked topic:", hashtag);
  };

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
          <div className={styles.widgetsContainer}>
            {/* Trending Topics */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <h3 className={styles.widgetTitle}>Trending Topics</h3>
              </div>

              <div className={styles.topicsList}>
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className={styles.topicItem}
                    onClick={() => handleTopicClick(topic.hashtag)}
                  >
                    <div className={styles.topicRank}>{index + 1}</div>
                    <div className={styles.topicContent}>
                      <div className={styles.hashtag}>{topic.hashtag}</div>
                      <div className={styles.postCount}>
                        {topic.posts.toLocaleString()} posts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <h3 className={styles.widgetTitle}>Upcoming Events</h3>
              </div>

              <div className={styles.eventsList}>
                {upcomingEvents.map((event) => (
                  <div key={event.id} className={styles.eventCard}>
                    <div className={styles.eventDate}>
                      <div className={styles.dateDay}>
                        {new Date(event.date).getDate()}
                      </div>
                      <div className={styles.dateMonth}>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                    </div>

                    <div className={styles.eventDetails}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      <div className={styles.eventInfo}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="5.5"
                            stroke="#64748b"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <path
                            d="M7 4v3l2 2"
                            stroke="#64748b"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>{event.time}</span>
                      </div>
                      <div className={styles.eventInfo}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 7 5 7s5-3.5 5-7c0-2.76-2.24-5-5-5z"
                            stroke="#64748b"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <circle
                            cx="7"
                            cy="6"
                            r="1.5"
                            stroke="#64748b"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.attendees}>
                        {event.attendees} people interested
                      </div>

                      <button
                        className={`${styles.interestBtn} ${
                          interestedEvents.has(event.id)
                            ? styles.interestedBtn
                            : ""
                        }`}
                        onClick={() => toggleInterest(event.id)}
                      >
                        {interestedEvents.has(event.id) ? (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M13 4L6 11L3 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Interested
                          </>
                        ) : (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M8 3v10M3 8h10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                            Interested?
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className={styles.viewAllBtn}>View All Events</button>
            </div>
          </div>
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
        <div
          onClick={() => {
            router.push("/profile");
          }}
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
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>

          <p>Your Profile</p>
        </div>
      </div>
    </div>
  );
}
