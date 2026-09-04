import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://proconnect-1-8mwt.onrender.com";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token automatically if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API endpoint methods
export const api = {
  // Auth
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getMe: () => apiClient.get("/auth/me"),
  uploadAvatar: (formData) =>
    apiClient.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Profiles
  getMyProfile: () => apiClient.get("/profiles/me"),
  getProfileByUsername: (username) => apiClient.get(`/profiles/${username}`),
  updateProfile: (profileData) => apiClient.put("/profiles/me", profileData),
  getAllProfiles: (params) => apiClient.get("/profiles/all", { params }),

  // Posts & Feed
  getAllPosts: (params) => apiClient.get("/posts", { params }),
  createPost: (formData) =>
    apiClient.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`),
  likePost: (postId) => apiClient.post(`/posts/${postId}/like`),
  dislikePost: (postId) => apiClient.post(`/posts/${postId}/dislike`),

  // Comments
  getComments: (postId) => apiClient.get(`/comments/post/${postId}`),
  addComment: (data) => apiClient.post("/comments", data),
  deleteComment: (commentId) => apiClient.delete(`/comments/${commentId}`),

  // Connections & Network
  sendConnectionRequest: (connectionId) =>
    apiClient.post("/connections/request", { connectionId }),
  getMyConnections: () => apiClient.get("/connections/my"),
  respondToConnection: (data) => apiClient.post("/connections/respond", data),

  // Realtime Messaging
  getConversations: () => apiClient.get("/messages/conversations"),
  startConversation: (recipientId) =>
    apiClient.post("/messages/conversations", { recipientId }),
  getMessages: (conversationId) =>
    apiClient.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (messageData) => apiClient.post("/messages/messages", messageData),

  // Notifications
  getNotifications: (params) => apiClient.get("/notifications", { params }),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch("/notifications/read-all"),

  // Jobs & Applications
  getJobs: (params) => apiClient.get("/jobs", { params }),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (jobData) => apiClient.post("/jobs", jobData),
  applyForJob: (applicationData) => apiClient.post("/applications", applicationData),
  getMyApplications: () => apiClient.get("/applications/my"),

  // Search
  searchGlobal: (query) => apiClient.get("/search", { params: { q: query } }),

  // Communities & Groups
  getCommunities: (params) => apiClient.get("/communities", { params }),
  getCommunityById: (id) => apiClient.get(`/communities/${id}`),
  createCommunity: (data) => apiClient.post("/communities", data),
  toggleCommunityMembership: (id) => apiClient.post(`/communities/${id}/membership`),
  joinCommunity: (id) => apiClient.post(`/communities/${id}/membership`),
  updateCommunitySettings: (id, data) => apiClient.put(`/communities/${id}/settings`, data),
  manageCommunityModerator: (id, data) => apiClient.post(`/communities/${id}/moderators`, data),
  getCommunityMessages: (id, params) => apiClient.get(`/communities/${id}/messages`, { params }),
  sendCommunityMessage: (id, data) => apiClient.post(`/communities/${id}/messages`, data),
  voteCommunityMessage: (id, messageId, voteType) =>
    apiClient.post(`/communities/${id}/messages/${messageId}/vote`, { voteType }),
  deleteCommunityMessage: (id, messageId) =>
    apiClient.delete(`/communities/${id}/messages/${messageId}`),
  uploadCommunityImage: (id, formData) =>
    apiClient.post(`/communities/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default apiClient;
