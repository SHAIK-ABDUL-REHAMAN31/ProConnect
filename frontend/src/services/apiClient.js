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

// Automatic token refresh on 401 with rotation & concurrency lock
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        const data = response.data?.data || response.data;
        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Clear auth state on refresh failure or reuse security alert
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=1";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API endpoint methods
export const api = {
  // Auth & Email Verification
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  googleAuth: (googleData) => apiClient.post("/auth/google", googleData),
  refreshToken: (refreshToken) => apiClient.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken) => apiClient.post("/auth/logout", { refreshToken }),
  checkEmailDns: (email) => apiClient.post("/auth/verify-dns", { email }),
  checkUsername: (username, config) =>
    apiClient.get("/auth/check-username", { params: { username }, ...config }),
  sendEmailOtp: (data) => apiClient.post("/auth/send-otp", data),
  verifyEmailOtp: (data) => apiClient.post("/auth/verify-otp", data),
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
