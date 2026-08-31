import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "./communities.module.css";
import { api } from "@/services/apiClient";

const CATEGORIES = [
  "All",
  "Frontend",
  "Backend",
  "AI & ML",
  "DevOps & Cloud",
  "Mobile",
  "Career & Startups",
  "General",
];

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
];

const DEFAULT_COMMUNITIES = [
  {
    _id: "distributed-systems-cloud-architecture",
    name: "Distributed Systems & Cloud Architecture",
    category: "DevOps & Cloud",
    description:
      "A community for senior engineers discussing high-scale system design, microservices, Kubernetes, and distributed consensus algorithms.",
    icon: "☁️",
    banner: PRESET_BANNERS[0],
    members: ["user1", "user2"],
    membersCount: 1420,
    joined: true,
  },
  {
    _id: "ai-machine-learning-engineers",
    name: "AI & Machine Learning Engineers",
    category: "AI & ML",
    description:
      "Discussing LLM fine-tuning, RAG architectures, prompt engineering, computer vision, and autonomous agent systems in production.",
    icon: "🤖",
    banner: PRESET_BANNERS[1],
    members: [],
    membersCount: 2890,
    joined: false,
  },
  {
    _id: "full-stack-nextjs-architects",
    name: "Full Stack & Next.js Architects",
    category: "Frontend",
    description:
      "React 19, Server Actions, Next.js App Router, SSR performance optimization, TailwindCSS, and state synchronization UX patterns.",
    icon: "⚡",
    banner: PRESET_BANNERS[2],
    members: [],
    membersCount: 975,
    joined: false,
  },
  {
    _id: "tech-career-interview-prep-hub",
    name: "Tech Career & Interview Prep Hub",
    category: "Career & Startups",
    description:
      "Peer mock coding interviews, FAANG compensation breakdown, system design preparation, and career roadmap exchange.",
    icon: "🎯",
    banner: PRESET_BANNERS[3],
    members: ["user1"],
    membersCount: 3410,
    joined: true,
  },
];


export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState(DEFAULT_COMMUNITIES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover"); // "discover" | "myGroups"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Create Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("🚀");
  const [formBanner, setFormBanner] = useState(PRESET_BANNERS[0]);
  const [formRules, setFormRules] = useState(
    "1. Be respectful to all members\n2. No spam or self-promotion\n3. Share insightful knowledge"
  );
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await api.getCommunities({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });

      if (res.data?.data?.communities?.length > 0) {
        const currentUserId = currentUser?._id || currentUser?.id;
        const mapped = res.data.data.communities.map((c) => {
          const isMember = currentUserId
            ? c.members?.some((m) => (m._id || m) === currentUserId)
            : false;
          return {
            ...c,
            membersCount: c.members?.length || 1,
            joined: isMember,
            banner: c.banner || PRESET_BANNERS[0],
            icon: c.icon || "👥",
            category: c.category || "General",
          };
        });
        setCommunities(mapped);
      }
    } catch (err) {
      console.log("Using cached curated communities:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [selectedCategory, searchQuery, currentUser]);

  const handleToggleJoin = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      await api.toggleCommunityMembership(id);
    } catch (e) {
      console.log("Mocking toggle membership fallback");
    }

    setCommunities((prev) =>
      prev.map((c) => {
        if (c._id === id) {
          const nextJoined = !c.joined;
          return {
            ...c,
            joined: nextJoined,
            membersCount: nextJoined
              ? (c.membersCount || 0) + 1
              : Math.max(0, (c.membersCount || 1) - 1),
          };
        }
        return c;
      })
    );
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      alert("Please enter community name and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        icon: formIcon || "🚀",
        banner: formBanner || PRESET_BANNERS[0],
        rules: formRules,
        isPrivate: formIsPrivate,
      };

      const res = await api.createCommunity(payload);
      const created = res.data?.data?.community;

      if (created) {
        setIsCreateModalOpen(false);
        router.push(`/communities/${created._id}`);
      } else {
        // Fallback local addition
        const mockNew = {
          _id: `custom_${Date.now()}`,
          ...payload,
          membersCount: 1,
          joined: true,
          creatorId: currentUser?._id || "me",
        };
        setCommunities((prev) => [mockNew, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities = communities.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" ||
      c.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "discover" ? true : c.joined;

    return matchesCategory && matchesSearch && matchesTab;
  });

  return (
    <UserLayout>
      <Head>
        <title>Professional Groups & Communities | ProConnect</title>
        <meta
          name="description"
          content="Join high-impact engineering, AI, DevOps, and career communities on ProConnect."
        />
      </Head>
      <DashBoardLayout requireAuth={false}>
        <div className={styles.pageContainer}>
          {/* Hero Banner */}
          <div className={styles.heroSection}>
            <div className={styles.heroGlow} />
            <div className={styles.heroContent}>
              <div>
                <h1 className={styles.heroTitle}>Professional Groups & Hubs</h1>
                <p className={styles.heroSubtitle}>
                  Engage in technical discussions, share knowledge, vote on insights,
                  and interact in live group chats with verified professionals.
                </p>
              </div>
              <button
                className={styles.createBtn}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <span>➕</span> Create New Group
              </button>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className={styles.filterControls}>
            <div className={styles.searchBarWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search groups by name, keyword, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.categoryPills}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.categoryPill} ${
                    selectedCategory === cat ? styles.categoryPillActive : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className={styles.tabSwitch}>
            <button
              className={`${styles.tabBtn} ${
                activeTab === "discover" ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab("discover")}
            >
              Discover All ({communities.length})
            </button>
            <button
              className={`${styles.tabBtn} ${
                activeTab === "myGroups" ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab("myGroups")}
            >
              My Joined Groups ({communities.filter((c) => c.joined).length})
            </button>
          </div>

          {/* Groups Grid */}
          <div className={styles.grid}>
            {filteredCommunities.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <h3>No groups found</h3>
                <p>Try searching for a different keyword or create your own group!</p>
              </div>
            ) : (
              filteredCommunities.map((c) => (
                <div key={c._id} className={styles.groupCard}>
                  <div
                    className={styles.cardBanner}
                    style={{
                      backgroundImage: `url(${c.banner || PRESET_BANNERS[0]})`,
                    }}
                  >
                    <div className={styles.cardBannerOverlay} />
                    <span className={styles.cardCategoryBadge}>
                      {c.category || "General"}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardIconWrapper}>{c.icon || "👥"}</div>

                    <Link href={`/communities/${c._id}`} style={{ textDecoration: "none" }}>
                      <h2 className={styles.cardTitle}>{c.name}</h2>
                    </Link>

                    <p className={styles.cardDesc}>{c.description}</p>

                    <div className={styles.cardMeta}>
                      <div className={styles.cardMetaItem}>
                        <span>👥</span> {c.membersCount || 1} members
                      </div>
                      {c.isPrivate && (
                        <div className={styles.cardMetaItem}>
                          <span>🔒</span> Private
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <Link
                        href={`/communities/${c._id}`}
                        className={styles.viewGroupBtn}
                      >
                        Enter Group & Chat →
                      </Link>
                      <button
                        className={`${styles.joinBtn} ${
                          c.joined ? styles.joinedBtn : ""
                        }`}
                        onClick={(e) => handleToggleJoin(e, c._id)}
                      >
                        {c.joined ? "✓ Joined" : "+ Join"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create Group Modal */}
          {isCreateModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={() => setIsCreateModalOpen(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Create a New Community Group</h2>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateCommunity}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Group Name *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Next.js Core Contributors & Experts"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category / Topic Area</label>
                    <select
                      className={styles.formSelect}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Group Icon Emoji</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. 🚀, ⚡, 🤖, 🌐"
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description *</label>
                    <textarea
                      className={styles.formTextarea}
                      placeholder="What is this community about? What topics will be discussed?"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Group Banner</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Image URL or choose preset below"
                      value={formBanner}
                      onChange={(e) => setFormBanner(e.target.value)}
                    />
                    <div className={styles.presetBanners}>
                      {PRESET_BANNERS.map((bannerUrl, idx) => (
                        <div
                          key={idx}
                          className={`${styles.presetBannerThumb} ${
                            formBanner === bannerUrl
                              ? styles.presetBannerThumbActive
                              : ""
                          }`}
                          style={{ backgroundImage: `url(${bannerUrl})` }}
                          onClick={() => setFormBanner(bannerUrl)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Community Rules (One per line)</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={formRules}
                      onChange={(e) => setFormRules(e.target.value)}
                    />
                  </div>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Group"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
