import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "./index.module.css";
import { BASE_URL, clientServer } from "@/config";
import FullPageLoader from "@/components/FullPageLoader";
import {
  deletePost,
  getAboutUser,
  getAllPosts,
  incrementLike,
  decrementLike,
} from "@/config/redux/action/postAction";

const DEFAULT_BANNER = "https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'INFO' | 'BIO' | 'WORK_ADD' | 'WORK_EDIT' | 'EDU_ADD' | 'EDU_EDIT' | 'SKILL' | null
  const [editingIndex, setEditingIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Form states
  const [infoForm, setInfoForm] = useState({ name: "", currentPost: "", location: "" });
  const [bioText, setBioText] = useState("");
  const [workForm, setWorkForm] = useState({
    company: "",
    position: "",
    years: "",
    location: "",
    description: "",
  });
  const [eduForm, setEduForm] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likingPosts, setLikingPosts] = useState(new Set());

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const savedLikes = localStorage.getItem("likedPosts");
    if (savedLikes) {
      try {
        setLikedPosts(new Set(JSON.parse(savedLikes)));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
  }, [likedPosts]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getAllPosts());
    }
  }, [dispatch]);

  useEffect(() => {
    if (authState?.user) {
      setUserProfile(authState.user);
      setInfoForm({
        name: authState.user?.userId?.name || "",
        currentPost: authState.user?.currentPost || authState.user?.headline || "",
        location: authState.user?.location || "Global",
      });
      setBioText(authState.user?.bio || authState.user?.about || "");
    }
  }, [authState.user]);

  // Filter posts made by this user
  const userPosts = useMemo(() => {
    const username = authState?.user?.userId?.username;
    const userId = authState?.user?.userId?._id || authState?.user?._id;
    if (!username && !userId) return [];
    return (postReducer.posts || []).filter((post) => {
      const pUsername = post.userId?.username;
      const pId = post.userId?._id || post.userId?.id || post.userId;
      return (
        (username && pUsername === username) ||
        (userId && pId && pId.toString() === userId.toString())
      );
    });
  }, [authState.user, postReducer.posts]);

  if (!userProfile) {
    return <FullPageLoader text="Loading your professional profile..." />;
  }

  const { userId, bio, currentPost, location, pastWork = [], education = [], skills = [], coverPicture } = userProfile;

  const getImageUrl = (imagePath, name = "User") => {
    if (!imagePath)
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&bold=true`;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  // Upload Profile Picture
  const handleProfilePictureUpload = async (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("token", token);
      formData.append("profile_picture", file);

      await clientServer.post("/profile_picture_update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await dispatch(getAboutUser({ token }));
      showToast("Profile photo updated successfully!");
    } catch (err) {
      console.error("Profile picture upload failed:", err);
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  // Save profile updates to backend
  const saveProfileData = async (updatedFields, successMsg = "Profile updated!") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Update Profile model
      await clientServer.post("/update_user_data", {
        token,
        ...updatedFields,
      });

      // Update User name if provided
      if (updatedFields.name && updatedFields.name !== userId?.name) {
        await clientServer.post("/update_user_profile", {
          token,
          name: updatedFields.name,
        });
      }

      await dispatch(getAboutUser({ token }));
      showToast(successMsg);
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Error saving profile details.");
    }
  };

  // Bio Update Handler
  const handleSaveBio = async (e) => {
    e.preventDefault();
    await saveProfileData({ bio: bioText }, "About summary updated!");
  };

  // Basic Info Update Handler
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    await saveProfileData(
      {
        name: infoForm.name,
        currentPost: infoForm.currentPost,
        location: infoForm.location,
      },
      "Basic information updated!"
    );
  };

  // Work Experience Handlers
  const handleSaveWork = async (e) => {
    e.preventDefault();
    let updatedWork = [...pastWork];
    if (activeModal === "WORK_EDIT" && editingIndex !== null) {
      updatedWork[editingIndex] = workForm;
    } else {
      updatedWork.unshift(workForm);
    }
    await saveProfileData({ pastWork: updatedWork }, "Work experience saved!");
    setWorkForm({ company: "", position: "", years: "", location: "", description: "" });
  };

  const handleDeleteWork = async (idx) => {
    if (!confirm("Are you sure you want to remove this experience?")) return;
    const updatedWork = pastWork.filter((_, i) => i !== idx);
    await saveProfileData({ pastWork: updatedWork }, "Experience removed.");
  };

  const openEditWork = (work, idx) => {
    setWorkForm(work);
    setEditingIndex(idx);
    setActiveModal("WORK_EDIT");
  };

  // Education Handlers
  const handleSaveEdu = async (e) => {
    e.preventDefault();
    let updatedEdu = [...education];
    if (activeModal === "EDU_EDIT" && editingIndex !== null) {
      updatedEdu[editingIndex] = eduForm;
    } else {
      updatedEdu.unshift(eduForm);
    }
    await saveProfileData({ education: updatedEdu }, "Education details saved!");
    setEduForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" });
  };

  const handleDeleteEdu = async (idx) => {
    if (!confirm("Are you sure you want to remove this education entry?")) return;
    const updatedEdu = education.filter((_, i) => i !== idx);
    await saveProfileData({ education: updatedEdu }, "Education entry removed.");
  };

  const openEditEdu = (edu, idx) => {
    setEduForm(edu);
    setEditingIndex(idx);
    setActiveModal("EDU_EDIT");
  };

  // Skills Handlers
  const handleAddSkill = async (e) => {
    e?.preventDefault();
    const skill = skillInput.trim();
    if (!skill) return;
    if (skills.includes(skill)) {
      setSkillInput("");
      return;
    }
    const updatedSkills = [...skills, skill];
    await saveProfileData({ skills: updatedSkills }, `Skill '${skill}' added!`);
    setSkillInput("");
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter((s) => s !== skillToRemove);
    await saveProfileData({ skills: updatedSkills }, "Skill removed.");
  };

  // PDF Profile Download
  const handleDownloadProfile = async () => {
    try {
      showToast("Generating your profile PDF...");
      const targetId = userId?._id || userId;
      const response = await clientServer.get(`/user/download_profile?id=${targetId}`);
      if (response.data?.message) {
        window.open(`${BASE_URL}/uploads/${response.data.message}`, "_blank");
      }
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download profile PDF.");
    }
  };

  const bannerImg = coverPicture || DEFAULT_BANNER;

  return (
    <UserLayout>
      <Head>
        <title>{userId?.name ? `${userId.name} | My Profile` : "My Profile | ProConnect 2.0"}</title>
        <meta
          name="description"
          content="View, manage, and edit your professional profile, work history, education, skills, and activities on ProConnect."
        />
      </Head>

      <DashBoardLayout requireAuth={true}>
        <div className={styles.profilePageWrapper}>
          {toastMessage && <div className={styles.toastBanner}>{toastMessage}</div>}

          {/* ================= 1. PROFILE HEADER CARD ================= */}
          <div className={styles.profileHeaderCard}>
            {/* Cover Banner */}
            <div
              className={styles.bannerBackdrop}
              style={{ backgroundImage: `url(${bannerImg})` }}
            >
              <div className={styles.bannerOverlay}></div>
            </div>

            {/* Avatar & Action Bar */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <img
                  className={styles.profileAvatar}
                  src={getImageUrl(userId?.profilePicture, userId?.name)}
                  alt={userId?.name || "Profile"}
                />
                <label
                  htmlFor="avatarInput"
                  className={styles.avatarUploadBadge}
                  title="Upload profile picture"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfilePictureUpload(e.target.files[0])}
                    hidden
                    disabled={uploading}
                  />
                </label>
                {uploading && <div className={styles.uploadingSpinner}>Uploading...</div>}
              </div>

              {/* Action Buttons */}
              <div className={styles.headerActionButtons}>
                <button
                  className={styles.editProfileBtn}
                  onClick={() => setActiveModal("INFO")}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button
                  className={styles.downloadPdfBtn}
                  onClick={handleDownloadProfile}
                  title="Export Profile as PDF"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download Resume</span>
                </button>
              </div>
            </div>

            {/* Personal Details */}
            <div className={styles.profileDetailsContent}>
              <div className={styles.nameRow}>
                <h1 className={styles.profileName}>{userId?.name || "Professional"}</h1>
                <span className={styles.profileHandle}>@{userId?.username}</span>
              </div>

              <p className={styles.profileHeadline}>
                {currentPost || bio || "Professional on ProConnect • Open to Opportunities"}
              </p>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {location || "Global"}
                </span>

                <span className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {userId?.email}
                </span>

                <span className={styles.metaBadge}>Pro Member</span>
              </div>
            </div>
          </div>

          {/* ================= 2. ABOUT / BIO SECTION ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h2>About</h2>
              </div>
              <button
                className={styles.sectionActionBtn}
                onClick={() => setActiveModal("BIO")}
                title="Edit About Bio"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit</span>
              </button>
            </div>

            <div className={styles.aboutContent}>
              {bio ? (
                <p className={styles.aboutText}>{bio}</p>
              ) : (
                <p className={styles.emptyPrompt}>
                  Share a brief summary about your background, career focus, and achievements to stand out to connections and recruiters.
                </p>
              )}
            </div>
          </div>

          {/* ================= 3. WORK EXPERIENCE SECTION ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <h2>Experience</h2>
              </div>
              <button
                className={styles.sectionActionBtn}
                onClick={() => {
                  setWorkForm({ company: "", position: "", years: "", location: "", description: "" });
                  setActiveModal("WORK_ADD");
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Experience</span>
              </button>
            </div>

            <div className={styles.timelineList}>
              {pastWork && pastWork.length > 0 ? (
                pastWork.map((work, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0a66c2" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    </div>

                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <div>
                          <h3 className={styles.itemTitle}>{work.position || "Position / Role"}</h3>
                          <h4 className={styles.itemSubtitle}>{work.company || "Company"}</h4>
                        </div>
                        <div className={styles.itemActions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => openEditWork(work, idx)}
                            title="Edit"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                            onClick={() => handleDeleteWork(idx)}
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className={styles.itemMeta}>
                        {work.years && <span className={styles.metaChip}>{work.years}</span>}
                        {work.location && <span className={styles.metaLocation}>• {work.location}</span>}
                      </div>

                      {work.description && (
                        <p className={styles.itemDescription}>{work.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyPrompt}>
                  No work experience listed yet. Add your past and current roles to showcase your career journey.
                </p>
              )}
            </div>
          </div>

          {/* ================= 4. EDUCATION SECTION ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <h2>Education</h2>
              </div>
              <button
                className={styles.sectionActionBtn}
                onClick={() => {
                  setEduForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" });
                  setActiveModal("EDU_ADD");
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Education</span>
              </button>
            </div>

            <div className={styles.timelineList}>
              {education && education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0a66c2" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                    </div>

                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <div>
                          <h3 className={styles.itemTitle}>{edu.school || "University / College"}</h3>
                          <h4 className={styles.itemSubtitle}>
                            {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" • ") || "Degree"}
                          </h4>
                        </div>
                        <div className={styles.itemActions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => openEditEdu(edu, idx)}
                            title="Edit"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                            onClick={() => handleDeleteEdu(idx)}
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {(edu.startDate || edu.endDate) && (
                        <div className={styles.itemMeta}>
                          <span className={styles.metaChip}>
                            {[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}
                          </span>
                        </div>
                      )}

                      {edu.description && (
                        <p className={styles.itemDescription}>{edu.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyPrompt}>
                  No education history added. Add your school, college, or certifications.
                </p>
              )}
            </div>
          </div>

          {/* ================= 5. SKILLS SECTION ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <h2>Skills & Expertise</h2>
              </div>
            </div>

            {/* Add Skill Input */}
            <form className={styles.skillInputRow} onSubmit={handleAddSkill}>
              <input
                type="text"
                placeholder="Add a skill (e.g. React, Node.js, Python, UI Design)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className={styles.skillInputField}
              />
              <button type="submit" className={styles.addSkillBtn} disabled={!skillInput.trim()}>
                + Add Skill
              </button>
            </form>

            {/* Skills Chips */}
            <div className={styles.skillsWrapper}>
              {skills && skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillChip}>
                    <span>{skill}</span>
                    <button
                      type="button"
                      className={styles.removeSkillBtn}
                      onClick={() => handleRemoveSkill(skill)}
                      title={`Remove ${skill}`}
                    >
                      ✕
                    </button>
                  </span>
                ))
              ) : (
                <p className={styles.emptyPrompt}>
                  Highlight your top technical and professional skills above.
                </p>
              )}
            </div>
          </div>

          {/* ================= 6. RECENT ACTIVITY / MY POSTS ================= */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <h2>Recent Activity & Posts ({userPosts.length})</h2>
              </div>
              <button
                className={styles.sectionActionBtn}
                onClick={() => router.push("/")}
              >
                <span>+ Create Post</span>
              </button>
            </div>

            <div className={styles.postsList}>
              {userPosts.length > 0 ? (
                userPosts.map((post) => {
                  const isLiked = likedPosts.has(post._id);
                  return (
                    <div key={post._id} className={styles.postCardItem}>
                      <div className={styles.postCardHeader}>
                        <img
                          src={getImageUrl(userId?.profilePicture, userId?.name)}
                          alt={userId?.name || "User"}
                          className={styles.postCardAvatar}
                        />
                        <div className={styles.postCardUserInfo}>
                          <strong>{userId?.name}</strong>
                          <span>@{userId?.username} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>

                        <button
                          className={styles.postDeleteBtn}
                          onClick={async () => {
                            if (!confirm("Are you sure you want to delete this post?")) return;
                            await dispatch(deletePost({ post_id: post._id }));
                            await dispatch(getAllPosts());
                            showToast("Post deleted.");
                          }}
                          title="Delete post"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      <p className={styles.postBodyText}>{post.body}</p>

                      {post.media && (
                        <div className={styles.postMediaWrapper}>
                          <img src={getImageUrl(post.media)} alt="Post Attachment" />
                        </div>
                      )}

                      <div className={styles.postFooterBar}>
                        <button
                          className={`${styles.postLikeBtn} ${isLiked ? styles.postLiked : ""}`}
                          onClick={async () => {
                            if (likingPosts.has(post._id)) return;
                            try {
                              setLikingPosts((prev) => new Set(prev).add(post._id));
                              if (isLiked) {
                                setLikedPosts((prev) => {
                                  const s = new Set(prev);
                                  s.delete(post._id);
                                  return s;
                                });
                                await dispatch(decrementLike({ post_id: post._id }));
                              } else {
                                setLikedPosts((prev) => new Set(prev).add(post._id));
                                await dispatch(incrementLike({ post_id: post._id }));
                              }
                              await dispatch(getAllPosts());
                            } finally {
                              setLikingPosts((prev) => {
                                const s = new Set(prev);
                                s.delete(post._id);
                                return s;
                              });
                            }
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "currentColor"} strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span>{post.likesCount || (isLiked ? 1 : 0)} Likes</span>
                        </button>

                        <div className={styles.postCommentStat}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span>{post.comments?.length || 0} Comments</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyPostsState}>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <p>No activity yet. Share an update, article, or project with your network.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}

        {/* 1. EDIT BASIC INFO MODAL */}
        {activeModal === "INFO" && (
          <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Edit Basic Information</h3>
                <button className={styles.modalCloseBtn} onClick={() => setActiveModal(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveInfo} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={infoForm.name}
                    onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                    placeholder="Your Full Name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Headline / Current Role</label>
                  <input
                    type="text"
                    value={infoForm.currentPost}
                    onChange={(e) => setInfoForm({ ...infoForm, currentPost: e.target.value })}
                    placeholder="e.g. Senior Software Engineer at Tech Corp"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={infoForm.location}
                    onChange={(e) => setInfoForm({ ...infoForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or London, UK"
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. EDIT BIO / ABOUT MODAL */}
        {activeModal === "BIO" && (
          <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Edit About Summary</h3>
                <button className={styles.modalCloseBtn} onClick={() => setActiveModal(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveBio} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>About You (Max 500 characters)</label>
                  <textarea
                    rows={5}
                    maxLength={500}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Write a brief professional summary about your expertise, background, and goals..."
                  />
                  <span className={styles.charCount}>{bioText.length}/500</span>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn}>Save About</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. WORK EXPERIENCE MODAL */}
        {(activeModal === "WORK_ADD" || activeModal === "WORK_EDIT") && (
          <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{activeModal === "WORK_EDIT" ? "Edit Experience" : "Add Experience"}</h3>
                <button className={styles.modalCloseBtn} onClick={() => setActiveModal(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveWork} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={workForm.company}
                    onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                    placeholder="e.g. Google, Microsoft, Startup Inc."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Role / Position *</label>
                  <input
                    type="text"
                    required
                    value={workForm.position}
                    onChange={(e) => setWorkForm({ ...workForm, position: e.target.value })}
                    placeholder="e.g. Frontend Developer, Product Manager"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duration / Years</label>
                    <input
                      type="text"
                      value={workForm.years}
                      onChange={(e) => setWorkForm({ ...workForm, years: e.target.value })}
                      placeholder="e.g. 2 yrs or 2022 - Present"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Location</label>
                    <input
                      type="text"
                      value={workForm.location}
                      onChange={(e) => setWorkForm({ ...workForm, location: e.target.value })}
                      placeholder="e.g. New York, NY / Remote"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description & Responsibilities</label>
                  <textarea
                    rows={3}
                    value={workForm.description}
                    onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                    placeholder="Describe key responsibilities, leadership, and technologies used..."
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn}>Save Experience</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. EDUCATION MODAL */}
        {(activeModal === "EDU_ADD" || activeModal === "EDU_EDIT") && (
          <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{activeModal === "EDU_EDIT" ? "Edit Education" : "Add Education"}</h3>
                <button className={styles.modalCloseBtn} onClick={() => setActiveModal(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveEdu} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>School / University *</label>
                  <input
                    type="text"
                    required
                    value={eduForm.school}
                    onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                    placeholder="e.g. Stanford University, MIT"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Degree</label>
                    <input
                      type="text"
                      value={eduForm.degree}
                      onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                      placeholder="e.g. Bachelor of Science"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={eduForm.fieldOfStudy}
                      onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Start Year</label>
                    <input
                      type="text"
                      value={eduForm.startDate}
                      onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                      placeholder="e.g. 2020"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>End Year (or Expected)</label>
                    <input
                      type="text"
                      value={eduForm.endDate}
                      onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                      placeholder="e.g. 2024"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Activities / Notes</label>
                  <textarea
                    rows={2}
                    value={eduForm.description}
                    onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                    placeholder="e.g. GPA, societies, student projects..."
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn}>Save Education</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashBoardLayout>
    </UserLayout>
  );
}
