import React, { useState, useEffect } from "react";
import Head from "next/head";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import apiClient from "@/services/apiClient";
import styles from "./events.module.css";

const MOCK_EVENTS = [
  {
    _id: "evt1",
    title: "Building Real-Time Distributed Architectures with Socket.IO & Redis",
    category: "Tech Talk",
    eventType: "VIRTUAL",
    eventDate: "2026-08-28T18:30:00.000Z",
    durationMinutes: 75,
    speakerName: "Alexandre Dev",
    speakerRole: "Principal Distributed Systems Architect",
    speakerCompany: "CloudScale Systems",
    speakerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    description: "Deep dive into scaling stateful WebSocket clusters, horizontal pub/sub adapters, Redis presence tracking, and zero-downtime deployments.",
    locationOrLink: "ProConnect Stage 1",
    attendees: ["u1", "u2", "u3", "u4", "u5"],
    maxCapacity: 1000,
    tags: ["Distributed Systems", "WebSockets", "Node.js", "Redis"],
  },
  {
    _id: "evt2",
    title: "AI Career Masterclass: Cracking Staff Engineer & Architect Interviews",
    category: "Webinar",
    eventType: "VIRTUAL",
    eventDate: "2026-08-30T17:00:00.000Z",
    durationMinutes: 90,
    speakerName: "Elena Rostova",
    speakerRole: "VP of Engineering & Ex-FAANG Bar Raiser",
    speakerCompany: "Apex Talent Network",
    speakerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    description: "Learn how to structure complex distributed system design answers, demonstrate behavioral impact, and negotiate competitive compensation packages.",
    locationOrLink: "ProConnect Live Stage",
    attendees: ["u1", "u2", "u6", "u7"],
    maxCapacity: 500,
    tags: ["Career", "System Design", "Interview Prep", "Leadership"],
  },
  {
    _id: "evt3",
    title: "Generative AI Hackathon: Building Autonomous Agentic Workflows",
    category: "Hackathon",
    eventType: "VIRTUAL",
    eventDate: "2026-09-05T14:00:00.000Z",
    durationMinutes: 240,
    speakerName: "Marcus Vance",
    speakerRole: "Lead AI Researcher",
    speakerCompany: "Nexus Neural Labs",
    speakerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    description: "4-hour rapid agent hackathon. Teams build RAG-powered assistants and autonomous tool-calling agents with live judging and $10,000 prize pool.",
    locationOrLink: "ProConnect Hack Arena",
    attendees: ["u1", "u3", "u8"],
    maxCapacity: 300,
    tags: ["AI", "Hackathon", "LLMs", "RAG", "Python"],
  },
];

export default function EventsHub() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [rsvpSet, setRsvpSet] = useState(new Set(["evt1", "evt2"]));
  const [liveEvent, setLiveEvent] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { user: "Sarah (Frontend Dev)", text: "Excited for this session! 🚀" },
    { user: "Devon (Cloud Architect)", text: "Audio and slides look super crisp." },
    { user: "Priya (SRE)", text: "Will we cover Redis cluster failovers?" },
  ]);
  const [newChatText, setNewChatText] = useState("");
  const [reactions, setReactions] = useState({ claps: 24, hearts: 18, rockets: 42 });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Webinar",
    eventDate: "",
    durationMinutes: 60,
    speakerName: "",
    speakerRole: "",
    speakerCompany: "",
    description: "",
    tags: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiClient.get("/events");
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setEvents(res.data.data);
        }
      } catch (err) {
        console.warn("Using mock events:", err.message);
      }
    };
    fetchEvents();
  }, []);

  const handleRsvp = async (eventId) => {
    setRsvpSet((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });

    try {
      await apiClient.post(`/events/${eventId}/rsvp`);
    } catch (err) {
      console.log("Simulated RSVP locally");
    }
  };

  const handleReact = (type) => {
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages((prev) => [...prev, { user: "You (Member)", text: newChatText }]);
    setNewChatText("");
  };

  const downloadIcs = (evt) => {
    const startDate = new Date(evt.eventDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(evt.eventDate).getTime() + (evt.durationMinutes || 60) * 60000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ProConnect//Events Hub//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${evt.locationOrLink}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${evt.title.slice(0, 20)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newEvt = {
      ...formData,
      _id: "evt_" + Date.now(),
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      bannerUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      speakerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      attendees: ["me"],
      locationOrLink: "ProConnect Virtual Stage",
    };
    setEvents([newEvt, ...events]);
    setShowCreateModal(false);
    alert("Event created & published to ProConnect Network!");
  };

  const filteredEvents = (Array.isArray(events) ? events : []).filter((evt) => {
    const matchesCategory =
      activeCategory === "All"
        ? true
        : activeCategory === "My RSVPs"
        ? rsvpSet.has(evt._id)
        : evt.category === activeCategory;
    const matchesSearch =
      search === "" ||
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.speakerName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <UserLayout>
      <Head>
        <title>Professional Events & Live Webinars | ProConnect</title>
        <meta
          name="description"
          content="Attend live tech talks, webinars, system design workshops, and hackathons on ProConnect."
        />
      </Head>

      <DashBoardLayout requireAuth={false}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.headerCard}>
            <div className={styles.titleSection}>
              <h1>🎟️ Events, Webinars & Live Stages</h1>
              <p className={styles.subtitle}>
                Learn from industry leaders, join interactive masterclasses, and expand your technical network.
              </p>
            </div>
            <button
              className={styles.createBtn}
              onClick={() => setShowCreateModal(true)}
            >
              + Host an Event
            </button>
          </div>

          {/* Search & Filter Section */}
          <div className={styles.searchAndFilter}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search events by title, speaker, or topics..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterBar}>
              {["All", "Webinar", "Tech Talk", "Hackathon", "My RSVPs"].map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterPill} ${activeCategory === cat ? styles.active : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === "My RSVPs" ? `⭐ ${cat} (${rsvpSet.size})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className={styles.grid}>
            {filteredEvents.map((evt) => {
              const isAttending = rsvpSet.has(evt._id);
              const formattedDate = new Date(evt.eventDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={evt._id} className={styles.eventCard}>
                  <div
                    className={styles.cardBanner}
                    style={{ backgroundImage: `url(${evt.bannerUrl})` }}
                  >
                    <span className={styles.cardCategory}>{evt.category}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.dateBadge}>📅 {formattedDate}</div>
                    <h3 className={styles.eventTitle}>{evt.title}</h3>

                    <div className={styles.speakerRow}>
                      <img
                        src={evt.speakerAvatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(evt.speakerName)}
                        alt={evt.speakerName}
                        className={styles.speakerAvatar}
                      />
                      <div className={styles.speakerInfo}>
                        <div className={styles.speakerName}>{evt.speakerName}</div>
                        <div className={styles.speakerRole}>
                          {evt.speakerRole} {evt.speakerCompany ? `@ ${evt.speakerCompany}` : ""}
                        </div>
                      </div>
                    </div>

                    <p className={styles.eventDesc}>{evt.description}</p>

                    <div className={styles.metaRow}>
                      <span>👥 {evt.attendees?.length || 1} registered</span>
                      <span>⏱️ {evt.durationMinutes} mins</span>
                      <span>📍 {evt.eventType}</span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.rsvpBtn} ${isAttending ? styles.attending : ""}`}
                        onClick={() => handleRsvp(evt._id)}
                      >
                        {isAttending ? "✓ Confirmed (RSVP)" : "+ RSVP Free"}
                      </button>

                      {isAttending && (
                        <button
                          title="Add to Calendar (.ics)"
                          className={styles.calendarBtn}
                          onClick={() => downloadIcs(evt)}
                        >
                          📅
                        </button>
                      )}

                      <button
                        className={styles.joinLiveBtn}
                        onClick={() => setLiveEvent(evt)}
                      >
                        🔴 Enter Stage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DashBoardLayout>

      {/* Interactive Live Stage Room Modal */}
      {liveEvent && (
        <div className={styles.liveStageOverlay}>
          <div className={styles.stageHeader}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className={styles.liveTag}>LIVE STAGE</span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  {liveEvent.title}
                </h2>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                Keynote Speaker: {liveEvent.speakerName} ({liveEvent.speakerRole})
              </p>
            </div>
            <button
              className={styles.cancelBtn}
              style={{ background: "#ef4444", color: "#ffffff", border: "none" }}
              onClick={() => setLiveEvent(null)}
            >
              ✕ Leave Stage Room
            </button>
          </div>

          <div className={styles.stageGrid}>
            {/* Live Video Stage */}
            <div className={styles.videoArea}>
              <img
                src={liveEvent.bannerUrl}
                alt="Stage Stream"
                className={styles.liveStreamMock}
              />
              <div className={styles.stageControls}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={liveEvent.speakerAvatar}
                    alt={liveEvent.speakerName}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid #ffffff" }}
                  />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#ffffff" }}>{liveEvent.speakerName}</div>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>Speaking Live</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleReact("claps")}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    👏 {reactions.claps}
                  </button>
                  <button
                    onClick={() => handleReact("hearts")}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    ❤️ {reactions.hearts}
                  </button>
                  <button
                    onClick={() => handleReact("rockets")}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    🚀 {reactions.rockets}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Interactive Chat Area */}
            <div className={styles.chatArea}>
              <div className={styles.chatHeader}>
                💬 Live Audience Q&A Stream
              </div>

              <div className={styles.chatMessages}>
                {chatMessages.map((msg, i) => (
                  <div key={i} className={styles.chatMsg}>
                    <div className={styles.chatMsgUser}>
                      {msg.user}
                    </div>
                    <div className={styles.chatMsgText}>{msg.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className={styles.chatInputRow}>
                <input
                  type="text"
                  placeholder="Ask a question or comment..."
                  className={styles.chatInput}
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                />
                <button
                  type="submit"
                  className={styles.chatSendBtn}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Host Event Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Host a ProConnect Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className={styles.formGroup}>
                <label>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass: Advanced Next.js App Router Architecture"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Webinar">Webinar</option>
                    <option value="Tech Talk">Tech Talk</option>
                    <option value="Live Workshop">Live Workshop</option>
                    <option value="AMA">AMA Session</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Speaker Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.speakerName}
                    onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Speaker Role & Org</label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Engineer @ TechCo"
                    value={formData.speakerRole}
                    onChange={(e) => setFormData({ ...formData, speakerRole: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Topic Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Architecture, Performance"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Event Description</label>
                <textarea
                  rows={3}
                  placeholder="What will attendees learn in this session?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
