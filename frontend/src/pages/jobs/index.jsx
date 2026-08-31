import React, { useState, useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashBoardLayout from "@/layout/dashboardLayout";
import styles from "./jobs.module.css";
import { api } from "@/services/apiClient";
import Head from "next/head";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [postFormData, setPostFormData] = useState({
    title: "",
    companyName: "",
    location: "Remote",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    salaryRange: "$90,000 - $120,000",
    description: "",
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs({
        search: search || undefined,
        jobType: filterType || undefined,
      });
      setJobs(res.data.data?.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, filterType]);

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      await api.applyForJob({
        jobId: selectedJob._id,
        coverNote,
      });
      alert("Application successfully submitted!");
      setShowApplyModal(false);
      setCoverNote("");
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit application.");
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await api.createJob(postFormData);
      alert("Job successfully posted!");
      setShowPostModal(false);
      setPostFormData({
        title: "",
        companyName: "",
        location: "Remote",
        jobType: "FULL_TIME",
        experienceLevel: "MID_LEVEL",
        salaryRange: "",
        description: "",
      });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post job. Please ensure you are logged in.");
    }
  };

  return (
    <UserLayout>
      <Head>
        <title>Career Opportunities & Jobs | ProConnect</title>
      </Head>
      <DashBoardLayout requireAuth={false}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.headerCard}>
            <div className={styles.titleSection}>
              <h1>Career Opportunities</h1>
              <p className={styles.subtitle}>
                Discover top engineering, product, and leadership roles at leading companies.
              </p>
            </div>
            <button
              className={styles.postJobBtn}
              onClick={() => setShowPostModal(true)}
            >
              + Post a Job
            </button>
          </div>

        {/* Search & Filter Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by role, company, or skills..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="REMOTE">Remote</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        {/* Job Grid */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading available positions...</p>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "12px" }}>
            <h3>No jobs found matching your criteria</h3>
            <p style={{ color: "#6b7280" }}>Be the first to post an open opportunity!</p>
          </div>
        ) : (
          <div className={styles.jobGrid}>
            {jobs.map((job) => (
              <div key={job._id} className={styles.jobCard}>
                <div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <div className={styles.company}>{job.companyName}</div>
                  <div className={styles.tags}>
                    <span className={styles.tag}>📍 {job.location}</span>
                    <span className={styles.tag}>💼 {job.jobType}</span>
                    <span className={styles.tag}>💰 {job.salaryRange}</span>
                  </div>
                  <p className={styles.jobDesc}>{job.description}</p>
                </div>
                <button
                  className={styles.applyBtn}
                  onClick={() => {
                    setSelectedJob(job);
                    setShowApplyModal(true);
                  }}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Apply for {selectedJob.title}</h2>
              <p style={{ color: "#0a66c2", fontWeight: 600, marginBottom: "1rem" }}>
                {selectedJob.companyName}
              </p>
              <div className={styles.formGroup}>
                <label>Cover Note / Pitch (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Introduce yourself and explain why you're a great fit for this role..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button className={styles.submitBtn} onClick={handleApply}>
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Job Modal */}
        {showPostModal && (
          <div className={styles.modalOverlay} onClick={() => setShowPostModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Post a New Job Opportunity</h2>
              <form onSubmit={handlePostJob}>
                <div className={styles.formGroup}>
                  <label>Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={postFormData.title}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, title: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Innovations"
                    value={postFormData.companyName}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, companyName: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / San Francisco, CA"
                    value={postFormData.location}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, location: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Job Type</label>
                  <select
                    value={postFormData.jobType}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, jobType: e.target.value })
                    }
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="REMOTE">Remote</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $100,000 - $140,000"
                    value={postFormData.salaryRange}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, salaryRange: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Job Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Key responsibilities, qualifications, and benefits..."
                    value={postFormData.description}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, description: e.target.value })
                    }
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowPostModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Publish Job Listing
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
