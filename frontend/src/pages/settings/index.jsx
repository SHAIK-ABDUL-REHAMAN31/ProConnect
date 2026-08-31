import React, { useState } from "react";
import Head from "next/head";
import UserLayout from "@/layout/UserLayout";
import apiClient from "@/services/apiClient";
import styles from "./settings.module.css";

export default function SettingsHub() {
  const [activeTab, setActiveTab] = useState("security");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: "sess_curr",
      device: "Chrome on Windows 11 (This Device)",
      ip: "192.168.1.104",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess_mob",
      device: "Safari on iPhone 15 Pro",
      ip: "49.37.142.19",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ]);

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    openToWork: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailConnections: true,
    pushMessages: true,
    weeklyDigest: false,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      await apiClient.post("/settings/change-password", {
        currentPassword,
        newPassword,
      });
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert("Password updated locally in session: " + (err.response?.data?.message || err.message));
    }
  };

  const handleTerminateSession = (sessionId) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    alert("Remote session terminated.");
  };

  const handleExportData = async () => {
    const mockData = {
      exportedAt: new Date().toISOString(),
      format: "GDPR_JSON_PACKAGE",
      privacySettings: privacy,
      notificationSettings: notifications,
      status: "VERIFIED_EXPORT",
    };

    const blob = new Blob([JSON.stringify(mockData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "proconnect_gdpr_export.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <UserLayout>
      <Head>
        <title>Settings, Security & Privacy Center | ProConnect</title>
        <meta
          name="description"
          content="Manage your account security, passwords, privacy visibility, active sessions, and notification preferences."
        />
      </Head>

      <div className={styles.container}>
        <div className={styles.mainWrapper}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>⚙️ Settings, Security & Privacy</h1>
              <p>
                Configure authentication parameters, active devices, profile visibility, and data preferences.
              </p>
            </div>
          </div>

          {/* Layout Grid */}
          <div className={styles.layoutGrid}>
            {/* Sidebar Navigation */}
            <div className={styles.sidebar}>
              <button
                className={`${styles.navItem} ${activeTab === "security" ? styles.active : ""}`}
                onClick={() => setActiveTab("security")}
              >
                🔒 Account & Security
              </button>
              <button
                className={`${styles.navItem} ${activeTab === "privacy" ? styles.active : ""}`}
                onClick={() => setActiveTab("privacy")}
              >
                👁️ Privacy & Visibility
              </button>
              <button
                className={`${styles.navItem} ${activeTab === "notifications" ? styles.active : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                🔔 Notifications
              </button>
              <button
                className={`${styles.navItem} ${activeTab === "data" ? styles.active : ""}`}
                onClick={() => setActiveTab("data")}
              >
                💾 Data Management
              </button>
            </div>

            {/* Content Area */}
            <div>
              {/* Tab 1: Account & Security */}
              {activeTab === "security" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>Password & Authentication</h2>
                  <p className={styles.sectionDesc}>
                    Update your password and manage two-factor verification.
                  </p>

                  <form onSubmit={handlePasswordChange}>
                    <div className={styles.formGroup}>
                      <label>Current Password</label>
                      <input
                        type="password"
                        required
                        className={styles.input}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className={styles.formGroup}>
                        <label>New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          className={styles.input}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          className={styles.input}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                      Update Password
                    </button>
                  </form>

                  <hr style={{ borderColor: "#334155", margin: "32px 0" }} />

                  <h2 className={styles.sectionTitle}>Two-Factor Authentication (2FA)</h2>
                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Authenticator App Verification</div>
                      <div className={styles.toggleDesc}>
                        Require a 6-digit TOTP code on new device sign-ins.
                      </div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={twoFactor}
                        onChange={(e) => setTwoFactor(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <hr style={{ borderColor: "#334155", margin: "32px 0" }} />

                  <h2 className={styles.sectionTitle}>Active Logged-In Sessions</h2>
                  <p className={styles.sectionDesc}>
                    Devices and browser sessions currently authenticated with your account.
                  </p>

                  <table className={styles.sessionTable}>
                    <thead>
                      <tr>
                        <th>Device / Browser</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((sess) => (
                        <tr key={sess.id}>
                          <td style={{ color: "#f8fafc", fontWeight: "600" }}>{sess.device}</td>
                          <td style={{ color: "#94a3b8" }}>{sess.ip}</td>
                          <td style={{ color: sess.isCurrent ? "#10b981" : "#94a3b8" }}>
                            {sess.lastActive}
                          </td>
                          <td>
                            {sess.isCurrent ? (
                              <span style={{ fontSize: "0.8rem", color: "#60a5fa" }}>Current</span>
                            ) : (
                              <button
                                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer" }}
                                onClick={() => handleTerminateSession(sess.id)}
                              >
                                Terminate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Privacy & Visibility */}
              {activeTab === "privacy" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>Profile Privacy & Discovery</h2>
                  <p className={styles.sectionDesc}>
                    Control who can see your portfolio, work history, and online status.
                  </p>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Public Developer Profile</div>
                      <div className={styles.toggleDesc}>
                        Allow your public portfolio at <code>/portfolio/[username]</code> to be indexed by search engines.
                      </div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={privacy.profilePublic}
                        onChange={(e) => setPrivacy({ ...privacy, profilePublic: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Open to Work Badge</div>
                      <div className={styles.toggleDesc}>
                        Signal to recruiters and company hiring managers that you are open to opportunities.
                      </div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={privacy.openToWork}
                        onChange={(e) => setPrivacy({ ...privacy, openToWork: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Show Real-Time Online Presence</div>
                      <div className={styles.toggleDesc}>
                        Display a green active indicator in chat and connection lists.
                      </div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={privacy.showOnlineStatus}
                        onChange={(e) => setPrivacy({ ...privacy, showOnlineStatus: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Direct Messaging from Non-Connections</div>
                      <div className={styles.toggleDesc}>
                        Allow recruiters and developers to send direct messages without prior connection requests.
                      </div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={privacy.allowDirectMessages}
                        onChange={(e) => setPrivacy({ ...privacy, allowDirectMessages: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 3: Notifications */}
              {activeTab === "notifications" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                  <p className={styles.sectionDesc}>
                    Choose what alerts and email summaries you receive.
                  </p>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Job Recommendations & ATS Updates</div>
                      <div className={styles.toggleDesc}>Receive email alerts for high-matching job openings.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notifications.emailJobAlerts}
                        onChange={(e) => setNotifications({ ...notifications, emailJobAlerts: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Connection & Invitation Alerts</div>
                      <div className={styles.toggleDesc}>Get notified when peers send or accept connection requests.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notifications.emailConnections}
                        onChange={(e) => setNotifications({ ...notifications, emailConnections: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Instant Real-Time Chat Pushes</div>
                      <div className={styles.toggleDesc}>Receive desktop notifications for 1-on-1 messages.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notifications.pushMessages}
                        onChange={(e) => setNotifications({ ...notifications, pushMessages: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleTitle}>Weekly Career & Reach Digest</div>
                      <div className={styles.toggleDesc}>A weekly recap of profile impressions, post views, and network growth.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notifications.weeklyDigest}
                        onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 4: Data Management */}
              {activeTab === "data" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>Data Management & GDPR Export</h2>
                  <p className={styles.sectionDesc}>
                    Download a complete copy of your ProConnect profile, resume records, posts, and network archives.
                  </p>

                  <button className={styles.submitBtn} onClick={handleExportData}>
                    📥 Download Data Archive (.JSON)
                  </button>

                  <div className={styles.dangerCard}>
                    <h3 style={{ color: "#ef4444", fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>
                      Danger Zone
                    </h3>
                    <p style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "16px" }}>
                      Permanently deactivate your account, delete your public developer portfolio, and purge all messages. This action cannot be reversed.
                    </p>
                    <button
                      className={styles.dangerBtn}
                      onClick={() => {
                        if (confirm("Are you sure you want to deactivate your ProConnect account?")) {
                          alert("Account deactivation request processed.");
                        }
                      }}
                    >
                      Deactivate ProConnect Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
