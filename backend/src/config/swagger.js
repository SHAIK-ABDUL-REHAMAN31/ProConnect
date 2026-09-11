import swaggerJsdoc from "swagger-jsdoc";
import { ENV } from "./env.js";

// ───────────────────────────────────────────────────────────
// OpenAPI 3.0.0 Specification for ProConnect 2.0 API
// ───────────────────────────────────────────────────────────

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "ProConnect Professional Social Platform API",
    version: "2.0.0",
    description:
      "Enterprise RESTful & Real-time WebSocket API for ProConnect — professional networking, feed posts, messaging, community discussions, jobs board, live code collaboration, and OAuth 2.0 with refresh token rotation.",
    contact: {
      name: "ProConnect Engineering Team",
      url: "https://pro-connect-eta.vercel.app",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1 Endpoint (Current Origin)",
    },
    {
      url: "http://localhost:5000/api/v1",
      description: "Local Development Server",
    },
    {
      url: "https://proconnect-1-8mwt.onrender.com/api/v1",
      description: "Production Server (Render)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Provide JWT Access Token generated from /auth/login or /auth/refresh",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully." },
          data: { type: "object" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid or expired token." },
          statusCode: { type: "integer", example: 401 },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "66f123456789abcdef012345" },
          name: { type: "string", example: "John Doe" },
          username: { type: "string", example: "johndoe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
          profilePicture: { type: "string", example: "https://res.cloudinary.com/.../avatar.jpg" },
          headline: { type: "string", example: "Senior Full Stack Engineer" },
          isEmailVerified: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66f987654321fedcba543210" },
          userId: { $ref: "#/components/schemas/User" },
          body: { type: "string", example: "Excited to announce our new distributed architecture!" },
          media: { type: "string", example: "https://res.cloudinary.com/.../post.png" },
          likes: { type: "array", items: { type: "string" } },
          commentsCount: { type: "integer", example: 12 },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66fabc1234567890abcdef12" },
          postId: { type: "string" },
          userId: { $ref: "#/components/schemas/User" },
          body: { type: "string", example: "Great milestone! Congrats." },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Job: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string", example: "Senior Backend Developer" },
          company: { type: "string", example: "TechCorp" },
          location: { type: "string", example: "San Francisco, CA (Remote)" },
          type: { type: "string", example: "Full-time" },
          description: { type: "string" },
          requirements: { type: "array", items: { type: "string" } },
          salary: { type: "string", example: "$140,000 - $180,000" },
        },
      },
      CodeSession: {
        type: "object",
        properties: {
          sessionId: { type: "string", example: "session-abc-123" },
          title: { type: "string", example: "Distributed Systems Discussion" },
          language: { type: "string", example: "javascript" },
          code: { type: "string", example: "console.log('Hello World');" },
          activeUsers: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication, Registration, OTP, OAuth, Token Rotation" },
    { name: "Profiles", description: "User profiles, experience, education, skills" },
    { name: "Posts", description: "Feed posts, media upload, likes and interactions" },
    { name: "Comments", description: "Post discussions and threaded responses" },
    { name: "Connections", description: "Professional networking graph & connection requests" },
    { name: "Messaging", description: "Real-time 1-on-1 direct messaging and conversations" },
    { name: "Notifications", description: "Real-time alerts, read state tracking, preferences" },
    { name: "Jobs", description: "Job postings, search, and career applications" },
    { name: "Communities", description: "Interest groups, forum discussions, and moderation" },
    { name: "Events", description: "Tech meetups, webinars, RSVPs" },
    { name: "CodeCollab", description: "Real-time collaborative code room synchronization" },
    { name: "Search", description: "Global full-text search across users, posts, and jobs" },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user account",
        description: "Creates a new user profile with real DNS MX verification and OTP confirmation.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "username", "password"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", example: "jane@company.com" },
                  username: { type: "string", example: "janedoe" },
                  password: { type: "string", example: "SuperSecurePass123!" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User successfully registered with dual JWT tokens" },
          400: { description: "Validation error or username/email taken" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user and initiate session",
        description: "Returns access token, refresh token with session family tracking, and profile details.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  email: { type: "string", example: "jane@company.com" },
                  username: { type: "string", example: "janedoe" },
                  password: { type: "string", example: "SuperSecurePass123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful with token pair" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate Refresh Token and issue new Access Token",
        description: "Implements OAuth 2.0 token rotation with family reuse detection. If an already-used refresh token is presented, all active sessions in the family are terminated.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "New access and refresh token pair issued" },
          401: { description: "Invalid/expired token or security reuse detected" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke active refresh token session",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated session user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Current user profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "Get paginated feed posts",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: { description: "Feed posts list" },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a new feed post with optional media upload",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  body: { type: "string", example: "Excited to share our newest architecture!" },
                  media: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Post created successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/posts/{id}": {
      delete: {
        tags: ["Posts"],
        summary: "Delete a post by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Post deleted" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/posts/{id}/like": {
      post: {
        tags: ["Posts"],
        summary: "Toggle like/unlike on a post",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Like toggled successfully" },
        },
      },
    },
    "/profiles/{username}": {
      get: {
        tags: ["Profiles"],
        summary: "Get user profile by username",
        parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Profile data" },
          404: { description: "Profile not found" },
        },
      },
    },
    "/connections/my": {
      get: {
        tags: ["Connections"],
        summary: "Get my confirmed connections and pending requests",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Connections list" },
        },
      },
    },
    "/connections/request": {
      post: {
        tags: ["Connections"],
        summary: "Send connection request to a user",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["connectionId"],
                properties: {
                  connectionId: { type: "string", example: "66f123456789abcdef012345" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Connection request sent" },
        },
      },
    },
    "/messages/conversations": {
      get: {
        tags: ["Messaging"],
        summary: "List direct conversations",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Conversations list" },
        },
      },
      post: {
        tags: ["Messaging"],
        summary: "Initiate conversation with a user",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["recipientId"],
                properties: {
                  recipientId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Conversation established" },
        },
      },
    },
    "/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "Search and filter job postings",
        parameters: [
          { name: "title", in: "query", schema: { type: "string" } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        ],
        responses: {
          200: { description: "Job postings" },
        },
      },
    },
    "/codecollab/sessions": {
      post: {
        tags: ["CodeCollab"],
        summary: "Create a real-time collaborative coding room",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "System Architecture Review" },
                  language: { type: "string", example: "javascript" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Session created" },
        },
      },
    },
    "/codecollab/sessions/{sessionId}": {
      get: {
        tags: ["CodeCollab"],
        summary: "Get code session state and participants",
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Session document and active code" },
        },
      },
    },
    "/codecollab/execute": {
      post: {
        tags: ["CodeCollab"],
        summary: "Execute polyglot code in sandboxed engine with test harness",
        description: "Executes JavaScript, Python, C++, or Java code in isolated runner environment with resource limits (3500ms timeout) and automated unit test case evaluation.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["language", "code"],
                properties: {
                  language: { type: "string", example: "python", enum: ["javascript", "typescript", "python", "cpp", "java"] },
                  code: { type: "string", example: "class Solution:\n    def twoSum(self, nums, target):\n        lookup = {}\n        for i, n in enumerate(nums):\n            if target - n in lookup: return [lookup[target - n], i]\n            lookup[n] = i\n        return []" },
                  problemId: { type: "string", example: "two-sum", enum: ["two-sum", "valid-parentheses", "lru-cache"] },
                  isSubmission: { type: "boolean", example: false },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Code executed successfully with test case results and performance metrics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        allPassed: { type: "boolean", example: true },
                        language: { type: "string", example: "python" },
                        duration: { type: "integer", example: 42 },
                        memory: { type: "string", example: "22.4 MB" },
                        stdout: { type: "string" },
                        stderr: { type: "string" },
                        results: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer", example: 1 },
                              label: { type: "string", example: "Case 1" },
                              passed: { type: "boolean", example: true },
                              input: { type: "string" },
                              expected: { type: "string" },
                              actual: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/modules/**/*.routes.js", "./routes/*.routes.js"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
