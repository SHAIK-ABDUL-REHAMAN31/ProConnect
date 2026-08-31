import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import apiClient from "@/services/apiClient";
import styles from "./saved.module.css";

const MOCK_SAVED = [
  {
    _id: "sav1",
    itemType: "JOB",
    title: "Senior Staff Infrastructure Engineer @ Stripe",
    subtitle: "San Francisco, CA & Remote • $195,000 - $260,000",
    link: "/jobs",
    collectionName: "Target Roles",
    notes: "Requires Go / Rust & distributed databases experience.",
    createdAt: "2026-08-23T14:20:00Z",
  },
  {
    _id: "sav2",
    itemType: "POST",
    title: "Alexandre Dev on Scaling Socket.IO Clusters with Redis",
    subtitle: "“When running multi-instance Node servers behind NGINX, sticky sessions and Redis pub/sub adapters are critical...”",
    link: "/",
    collectionName: "System Design",
    notes: "Reference for microservices refactor.",
    createdAt: "2026-08-22T09:15:00Z",
  },
  {
    _id: "sav3",
    itemType: "ARTICLE",
    title: "12-Week AI Career Coaching & ATS Optimization Guide",
    subtitle: "Comprehensive walkthrough of keyword density, semantic vector matching, and interview prep strategies.",
    link: "/ai",
    collectionName: "Career Growth",
    notes: "Study before the mock interview session.",
    createdAt: "2026-08-21T18:45:00Z",
  },
  {
    _id: "sav4",
    itemType: "JOB",
    title: "Frontend Architect — Developer Experience @ Vercel",
    subtitle: "Remote • $180,000 - $240,000",
    link: "/jobs",
    collectionName: "Target Roles",
    notes: "Focus on Next.js App Router and design systems.",
    createdAt: "2026-08-20T11:00:00Z",
  },
];

export default function SavedItemsHub() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState(MOCK_SAVED);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [collections, setCollections] = useState(["All", "Target Roles", "System Design", "Career Growth"]);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await apiClient.get("/saved");
        if (res.data?.data?.items?.length > 0) {
          setSavedItems(res.data.data.items);
          if (res.data.data.collections?.length > 0) {
            setCollections(["All", ...res.data.data.collections]);
          }
        }
      } catch (err) {
        console.warn("Using mock saved items:", err.message);
      }
    };
    fetchSaved();
  }, []);

  const handleRemove = async (id) => {
    setSavedItems((prev) => prev.filter((item) => item._id !== id));
    try {
      await apiClient.delete(`/saved/${id}`);
    } catch (err) {
      console.log("Simulated bookmark removal");
    }
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.itemType === activeTab;
    const matchesCollection =
      selectedCollection === "All" || item.collectionName === selectedCollection;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesCollection && matchesSearch;
  });

  return (
    <UserLayout>
      <Head>
        <title>Saved Items & Bookmarks Hub | ProConnect</title>
        <meta
          name="description"
          content="Access your saved posts, bookmarked job openings, and career articles organized in custom collections."
        />
      </Head>

      <DashBoardLayout requireAuth={false}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.headerCard}>
            <div className={styles.titleSection}>
              <h1>🔖 Saved Items & Collections</h1>
              <p className={styles.subtitle}>
                Your personal library of bookmarked posts, opportunities, articles, and research.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsRow}>
            {[
              { label: "All Items", key: "ALL", icon: "📑" },
              { label: "Saved Jobs", key: "JOB", icon: "💼" },
              { label: "Saved Posts", key: "POST", icon: "📰" },
              { label: "Saved Articles", key: "ARTICLE", icon: "📄" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tabBtn} ${activeTab === tab.key ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon} {tab.label} (
                {tab.key === "ALL"
                  ? savedItems.length
                  : savedItems.filter((i) => i.itemType === tab.key).length}
                )
              </button>
            ))}
          </div>

          {/* Controls: Search & Collections */}
          <div className={styles.searchAndFilter}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search saved items by title, notes, or keywords..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterBar}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600" }}>
                Collections:
              </span>
              {collections.map((col) => (
                <button
                  key={col}
                  className={`${styles.filterPill} ${
                    selectedCollection === col ? styles.active : ""
                  }`}
                  onClick={() => setSelectedCollection(col)}
                >
                  📁 {col}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className={styles.list}>
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📂</div>
                <h3>No saved items found</h3>
                <p>
                  Items you bookmark across the feed, job board, and articles will appear here.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                let badgeClass = styles.typePost;
                if (item.itemType === "JOB") badgeClass = styles.typeJob;
                if (item.itemType === "ARTICLE") badgeClass = styles.typeArticle;
                if (item.itemType === "PROFILE") badgeClass = styles.typeProfile;

                return (
                  <div key={item._id} className={styles.card}>
                    <div className={styles.cardInfo}>
                      <span className={`${styles.typeBadge} ${badgeClass}`}>
                        {item.itemType}
                      </span>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <p className={styles.itemSubtitle}>{item.subtitle}</p>

                      {item.notes && (
                        <div className={styles.itemNotes}>
                          💡 <strong>Note:</strong> {item.notes}
                        </div>
                      )}

                      <div className={styles.itemMeta}>
                        <span>📁 {item.collectionName}</span>
                        <span>
                          🗓️ Saved {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => router.push(item.link || "/")}
                      >
                        Open Item →
                      </button>
                      <button
                        className={styles.deleteBtn}
                        title="Remove Bookmark"
                        onClick={() => handleRemove(item._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
