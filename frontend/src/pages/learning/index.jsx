import React, { useState } from "react";
import Head from "next/head";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "./learning.module.css";

const MOCK_COURSES = [
  {
    _id: "c1",
    title: "Mastering Large-Scale System Design",
    slug: "mastering-large-scale-system-design",
    instructor: {
      name: "Dr. Aris Thorne",
      title: "Staff Software Architect @ Google Cloud",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    category: "System Design",
    level: "Advanced",
    durationHours: 6.5,
    rating: 4.96,
    enrolledCount: 3420,
    skillsCovered: ["Distributed Caching", "Rate Limiters", "Kafka", "Sharding", "CAP Theorem"],
    badgeTitle: "Certified System Architect",
    badgeIcon: "🌐",
    modules: [
      { title: "1. Global DNS, Anycast & CDN Acceleration", durationMinutes: 35 },
      { title: "2. Consistent Hashing & Database Sharding", durationMinutes: 45 },
      { title: "3. Distributed Event Streaming with Apache Kafka", durationMinutes: 50 },
      { title: "4. Designing a High-Throughput Rate Limiter", durationMinutes: 40 },
    ],
  },
  {
    _id: "c2",
    title: "Production-Grade AI & Agentic RAG Architecture",
    slug: "production-ai-agentic-rag",
    instructor: {
      name: "Marcus Vance",
      title: "Lead ML Research Engineer @ OpenAI",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    category: "AI & Machine Learning",
    level: "Intermediate",
    durationHours: 5.0,
    rating: 4.93,
    enrolledCount: 4890,
    skillsCovered: ["LangChain", "ChromaDB", "ReAct Framework", "Prompt Routing", "Evaluation"],
    badgeTitle: "Certified AI Engineer",
    badgeIcon: "🤖",
    modules: [
      { title: "1. Vector Embedding Geometry & Similarity Metrics", durationMinutes: 30 },
      { title: "2. Hybrid Search: Dense Vectors + BM25 Sparse Search", durationMinutes: 40 },
      { title: "3. Building Autonomous Multi-Agent Tool Loops", durationMinutes: 55 },
      { title: "4. RAG Triad Evaluation: Relevance & Faithfulness", durationMinutes: 35 },
    ],
  },
  {
    _id: "c3",
    title: "Modern Full-Stack Engineering with Next.js 15 & Node",
    slug: "modern-fullstack-nextjs-node",
    instructor: {
      name: "Elena Rostova",
      title: "VP Engineering @ Stripe",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    category: "Software Engineering",
    level: "Beginner",
    durationHours: 8.0,
    rating: 4.91,
    enrolledCount: 5210,
    skillsCovered: ["Next.js", "React Server Components", "TypeScript", "REST & WebSocket", "TailwindCSS"],
    badgeTitle: "Certified Full-Stack Developer",
    badgeIcon: "⚡",
    modules: [
      { title: "1. Next.js 15 App Router Deep Dive", durationMinutes: 40 },
      { title: "2. Server Actions, Optimistic UI & Mutations", durationMinutes: 45 },
      { title: "3. Real-Time WebSockets with Socket.IO", durationMinutes: 50 },
      { title: "4. End-to-End Type Safety with TypeScript & Zod", durationMinutes: 35 },
    ],
  },
];

export default function LearningHubPage() {
  const [courses] = useState(MOCK_COURSES);
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [myEnrollments, setMyEnrollments] = useState([
    {
      course: MOCK_COURSES[0],
      progress: 50,
      completedModules: [0, 1],
    },
  ]);
  const [viewingCourse, setViewingCourse] = useState(null);

  const handleEnroll = (course) => {
    if (myEnrollments.some((e) => e.course._id === course._id)) {
      setViewingCourse(course);
      return;
    }
    setMyEnrollments([...myEnrollments, { course, progress: 0, completedModules: [] }]);
    setViewingCourse(course);
  };

  const handleCompleteLesson = (moduleIdx) => {
    setMyEnrollments((prev) =>
      prev.map((e) => {
        if (e.course._id === viewingCourse._id) {
          const completed = e.completedModules.includes(moduleIdx)
            ? e.completedModules
            : [...e.completedModules, moduleIdx];
          const progress = Math.round((completed.length / viewingCourse.modules.length) * 100);
          return { ...e, completedModules: completed, progress };
        }
        return e;
      })
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(search.toLowerCase()) ||
      c.skillsCovered.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <UserLayout>
      <Head>
        <title>Courses & Learning Academy | ProConnect</title>
        <meta
          name="description"
          content="Upskill with masterclasses taught by senior architects from Google, Stripe, and OpenAI. Earn verified credentials."
        />
      </Head>

      <DashBoardLayout requireAuth={false}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.headerCard}>
            <div className={styles.titleSection}>
              <h1>🎓 Courses & Learning Academy</h1>
              <p className={styles.subtitle}>
                Upskill with masterclasses taught by senior engineers and architects from top tech companies.
              </p>
            </div>
          </div>

          {/* Active Course Curriculum Viewer */}
          {viewingCourse && (
            <div className={styles.courseViewerCard}>
              <div className={styles.viewerHeader}>
                <div>
                  <h2 className={styles.viewerTitle}>{viewingCourse.title}</h2>
                  <div className={styles.viewerInstructor}>
                    Taught by {viewingCourse.instructor.name} ({viewingCourse.instructor.title})
                  </div>
                </div>
                <button
                  className={styles.closeViewerBtn}
                  onClick={() => setViewingCourse(null)}
                >
                  ✕ Close Course
                </button>
              </div>

              <div className={styles.curriculumBox}>
                <h3 className={styles.curriculumTitle}>Course Curriculum</h3>
                <div className={styles.moduleList}>
                  {viewingCourse.modules.map((m, idx) => {
                    const enrollment = myEnrollments.find(
                      (e) => e.course._id === viewingCourse._id
                    );
                    const isDone = enrollment?.completedModules?.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`${styles.moduleItem} ${isDone ? styles.completed : ""}`}
                      >
                        <div>
                          <div
                            className={`${styles.moduleItemTitle} ${
                              isDone ? styles.completed : ""
                            }`}
                          >
                            {m.title}
                          </div>
                          <div className={styles.moduleItemDuration}>
                            ⏱️ {m.durationMinutes} minutes
                          </div>
                        </div>
                        <button
                          onClick={() => handleCompleteLesson(idx)}
                          className={`${styles.moduleActionBtn} ${
                            isDone ? styles.completed : ""
                          }`}
                        >
                          {isDone ? "✓ Completed" : "Mark as Watched"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabsRow}>
            <button
              onClick={() => setActiveTab("courses")}
              className={`${styles.tabBtn} ${activeTab === "courses" ? styles.active : ""}`}
            >
              📚 Course Catalog ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("my-learning")}
              className={`${styles.tabBtn} ${activeTab === "my-learning" ? styles.active : ""}`}
            >
              🎓 My Enrollments ({myEnrollments.length})
            </button>
          </div>

          {/* Search & Category Filter Section */}
          {activeTab === "courses" && (
            <div className={styles.searchAndFilter}>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search courses by topic, skill, or instructor..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className={styles.filterBar}>
                {["All", "System Design", "AI & Machine Learning", "Software Engineering"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`${styles.filterPill} ${
                      selectedCategory === cat ? styles.active : ""
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catalog Tab */}
          {activeTab === "courses" && (
            <div className={styles.grid}>
              {filteredCourses.map((course) => (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.instructorRow}>
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className={styles.instructorAvatar}
                    />
                    <div>
                      <div className={styles.instructorName}>{course.instructor.name}</div>
                      <div className={styles.instructorTitle}>{course.instructor.title}</div>
                    </div>
                  </div>

                  <h3 className={styles.courseTitle}>{course.title}</h3>

                  <div className={styles.skillsRow}>
                    {course.skillsCovered.map((s, idx) => (
                      <span key={idx} className={styles.skillTag}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className={styles.courseFooter}>
                    <div className={styles.rating}>
                      ⭐ {course.rating} ({course.enrolledCount.toLocaleString()})
                    </div>
                    <button
                      onClick={() => handleEnroll(course)}
                      className={styles.enrollBtn}
                    >
                      Enroll Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Enrollments Tab */}
          {activeTab === "my-learning" && (
            <div className={styles.grid}>
              {myEnrollments.map((item) => (
                <div key={item.course._id} className={styles.enrollmentCard}>
                  <h3 className={styles.courseTitle} style={{ minHeight: "auto" }}>
                    {item.course.title}
                  </h3>
                  <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
                    Instructor: {item.course.instructor.name}
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <span>Course Progress</span>
                      <span style={{ color: "#0a66c2" }}>{item.progress}%</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingCourse(item.course)}
                    className={styles.resumeBtn}
                  >
                    Resume Course →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}
