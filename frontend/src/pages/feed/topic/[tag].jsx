import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import apiClient from "@/services/apiClient";
import styles from "./topicFeed.module.css";

const MOCK_TOPIC_POSTS = [
  {
    _id: "p1",
    userId: {
      name: "Alexandre Dev",
      username: "alexandre",
      headline: "Principal Distributed Systems Architect",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    body: "When designing high-throughput real-time systems, choosing the right message broker is critical. Redis Pub/Sub vs RabbitMQ vs Apache Kafka. What are you using for sub-millisecond user notifications? #systemdesign #distributed",
    likesCount: 142,
    commentsCount: 38,
    createdAt: "2026-08-24T12:00:00Z",
  },
  {
    _id: "p2",
    userId: {
      name: "Elena Rostova",
      username: "elenar",
      headline: "VP of Engineering @ Apex",
      profilePicture: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    body: "Micro-frontends vs Monolithic SPAs for enterprise web apps in 2026. Module Federation has matured significantly, but team boundaries must dictate the architecture, not hype! #systemdesign #frontend",
    likesCount: 98,
    commentsCount: 22,
    createdAt: "2026-08-23T15:30:00Z",
  },
];

export default function TopicFeedPage() {
  const router = useRouter();
  const { tag } = router.query;
  const tagName = tag ? (tag.startsWith("#") ? tag : `#${tag}`) : "#systemdesign";

  const [posts, setPosts] = useState(MOCK_TOPIC_POSTS);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!tag) return;
    const fetchTopic = async () => {
      try {
        const cleanTag = tag.replace("#", "");
        const res = await apiClient.get(`/posts/topic/${cleanTag}`);
        if (res.data?.data?.length > 0) {
          setPosts(res.data.data);
        }
      } catch (err) {
        console.warn("Using mock topic posts:", err.message);
      }
    };
    fetchTopic();
  }, [tag]);

  return (
    <UserLayout>
      <Head>
        <title>{tagName} Posts & Discussions | ProConnect</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.mainWrapper}>
          {/* Topic Banner */}
          <div className={styles.topicBanner}>
            <div>
              <h1 className={styles.tagName}>{tagName}</h1>
              <p className={styles.tagStats}>
                🔥 14,820 Professionals following • 3,240 discussions
              </p>
            </div>
            <button
              className={`${styles.followBtn} ${isFollowing ? styles.following : ""}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? "✓ Following Topic" : "+ Follow Topic"}
            </button>
          </div>

          {/* Posts Feed */}
          {posts.map((post) => (
            <div key={post._id} className={styles.postCard}>
              <div className={styles.authorRow}>
                <img
                  src={
                    post.userId?.profilePicture ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(post.userId?.name || "User")
                  }
                  alt={post.userId?.name}
                  className={styles.avatar}
                />
                <div>
                  <div style={{ fontWeight: "700", color: "#f8fafc" }}>
                    {post.userId?.name}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    {post.userId?.headline} •{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <p className={styles.postBody}>{post.body}</p>

              <div className={styles.postActions}>
                <button className={styles.postActionBtn}>👍 {post.likesCount} Likes</button>
                <button className={styles.postActionBtn}>💬 {post.commentsCount} Comments</button>
                <button className={styles.postActionBtn}>🔄 Share</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
