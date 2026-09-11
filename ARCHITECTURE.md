# ProConnect 2.0 — Complete Application Architecture & Technical Documentation

> **Last Updated:** September 10, 2026
> **Version:** 2.0.0
> **Repository:** [github.com/SHAIK-ABDUL-REHAMAN31/ProConnect](https://github.com/SHAIK-ABDUL-REHAMAN31/ProConnect)

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Repository Structure](#3-repository-structure)
4. [Backend Architecture](#4-backend-architecture)
   - [Server & Application Bootstrap](#41-server--application-bootstrap)
   - [Configuration & Environment](#42-configuration--environment)
   - [Core Middleware Pipeline](#43-core-middleware-pipeline)
   - [Module Architecture (Controller → Service → Repository)](#44-module-architecture)
   - [All 19 Backend Modules Explained](#45-all-19-backend-modules-explained)
   - [API Versioning & Route Map](#46-api-versioning--route-map)
5. [Frontend Architecture](#5-frontend-architecture)
   - [Next.js Pages & Routing](#51-nextjs-pages--routing)
   - [State Management (Redux Toolkit)](#52-state-management-redux-toolkit)
   - [API Client & Axios Interceptors](#53-api-client--axios-interceptors)
   - [Real-Time Socket Context](#54-real-time-socket-context)
   - [UI Components & Layout System](#55-ui-components--layout-system)
   - [Code Collab 2.0 (LeetCode IDE Architecture)](#56-code-collab-20-leetcode-ide-architecture)
6. [Database Layer (MongoDB Atlas + Mongoose)](#6-database-layer)
7. [Authentication & Security](#7-authentication--security)
   - [JWT Dual-Token System](#71-jwt-dual-token-system)
   - [Email OTP Verification Pipeline](#72-email-otp-verification-pipeline)
   - [Role-Based Access Control (RBAC)](#73-role-based-access-control)
   - [Security Middleware Stack](#74-security-middleware-stack)
8. [Redis Infrastructure](#8-redis-infrastructure)
   - [Redis Client Singleton](#81-redis-client-singleton)
   - [Distributed Rate Limiting](#82-distributed-rate-limiting)
   - [Asynchronous Email Queue](#83-asynchronous-email-queue)
   - [Enterprise Cache-Aside Layer & Pattern Invalidation](#84-enterprise-cache-aside-layer--pattern-invalidation)
9. [Real-Time Communication (Socket.IO)](#9-real-time-communication)
10. [Media & File Uploads (Cloudinary)](#10-media--file-uploads)
11. [DevOps & Infrastructure](#11-devops--infrastructure)
    - [Docker Containerization](#111-docker-containerization)
    - [Docker Compose Orchestration](#112-docker-compose-orchestration)
    - [GitHub Actions CI/CD Pipeline](#113-github-actions-cicd-pipeline)
12. [Complete Request Lifecycle](#12-complete-request-lifecycle)
13. [Environment Variables Reference](#13-environment-variables-reference)
14. [Code Collab 2.0 Real-Time Architecture](#14-code-collab-20-real-time-architecture)
15. [Production Observability, Security & Testing Suite](#15-production-observability-security--testing-suite)
    - [15.1 Structured Logging & Distributed Tracing (Winston)](#151-structured-logging--distributed-tracing-winston)
    - [15.2 OAuth 2.0 Refresh Token Rotation & Reuse Detection](#152-oauth-20-refresh-token-rotation--reuse-detection)
    - [15.3 Interactive OpenAPI 3.0 Documentation (/api/docs)](#153-interactive-openapi-30-documentation-apidocs)
    - [15.4 Notification Pipeline & Email Digest Aggregator](#154-notification-pipeline--email-digest-aggregator)
    - [15.5 Automated Test Suite & CI/CD Integration (31 Tests)](#155-automated-test-suite--cicd-integration)
16. [Polyglot Sandbox Code Execution Engine](#16-polyglot-sandbox-code-execution-engine)
    - [16.1 Hybrid Sandboxed Execution Architecture](#161-hybrid-sandboxed-execution-architecture)
    - [16.2 Language Matrix & Test Harnesses](#162-language-matrix--test-harnesses)
    - [16.3 Real-Time Collaborative Result Synchronization](#163-real-time-collaborative-result-synchronization)
    - [16.4 Dual-Tier Fallback & Fault Tolerance](#164-dual-tier-fallback--fault-tolerance)

---

## 1. Platform Overview

**ProConnect 2.0** is an enterprise-grade professional networking, recruitment, portfolio, real-time communication, and career platform. It combines the functionality of **LinkedIn** (professional networking), **GitHub** (code collaboration), **Job Portals** (recruitment), and an **AI Career Coach** into one unified application.

### Core Capabilities:
- User registration with real-world DNS email verification and 6-digit OTP
- Professional profiles with portfolio showcase
- Social feed with posts, likes, comments, and hashtags
- Professional connections and networking
- Real-time 1-on-1 and group messaging with typing indicators
- Job listings, search, and full application lifecycle
- Communities and group discussions
- Events management
- Live code collaboration rooms
- Resume builder with PDF generation
- Learning modules and course management
- Push notifications (real-time via WebSocket)
- Admin dashboard and content moderation
- Global search across all entities

---

## 2. High-Level Architecture

```mermaid
graph TB
    subgraph Client Layer
        Browser["Browser / Mobile"]
    end

    subgraph "Frontend - Next.js 16 + React 19"
        Pages["Pages Router - 20 Routes"]
        Redux["Redux Toolkit Store"]
        Socket["Socket.IO Client"]
        API["Axios API Client"]
    end

    subgraph "Backend - Express.js 5 + Node.js 20"
        MW["Middleware Pipeline"]
        Router["API v1 Router - 18 Route Groups"]
        Modules["19 Domain Modules"]
        WSGateway["Socket.IO Gateway"]
        Queue["Email Queue Worker"]
    end

    subgraph "Data and Infrastructure"
        Mongo[("MongoDB Atlas")]
        Redis[("Redis / Upstash")]
        Cloud["Cloudinary"]
        SMTP["Gmail SMTP"]
    end

    Browser --> Pages
    Pages --> API
    Pages --> Socket
    API --> MW
    MW --> Router
    Router --> Modules
    Modules --> Mongo
    Modules --> Cloud
    Socket --> WSGateway
    MW --> Redis
    Queue --> Redis
    Queue --> SMTP
```

---

## 3. Repository Structure

```text
ProConnect/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI/CD Pipeline
│
├── backend/                              # Node.js + Express.js API Server
│   ├── Dockerfile                        # Production multi-stage Docker image
│   ├── .dockerignore                     # Docker build context exclusions
│   ├── .env                              # Local environment variables (git-ignored)
│   ├── package.json                      # Dependencies: express, mongoose, redis, socket.io
│   ├── server.js                         # HTTP server bootstrap, DB connect, Redis, Worker
│   │
│   ├── config/                           # Legacy configs (cloudinary, multer)
│   │   ├── cloudinary.js
│   │   └── multer.js
│   │
│   ├── models/                           # Legacy v1 Mongoose schemas
│   │   ├── userSchema.js
│   │   ├── postsSchema.js
│   │   ├── commentsSchema.js
│   │   ├── connectionsSchema.js
│   │   └── profileSchema.js
│   │
│   ├── routes/                           # Legacy v1 routes (backwards compatible)
│   │   ├── posts.routes.js
│   │   └── user.routes.js
│   │
│   ├── tests/                            # Automated Testing Suite (Node 22 + Supertest)
│   │   ├── unit/                         # Unit tests (AuthService, Logger)
│   │   └── integration/                  # Integration tests (API endpoints, Auth, RBAC)
│   │
│   └── src/                              # v2 Modular Architecture
│       ├── app.js                        # Express app, middleware chain, health checks
│       │
│       ├── config/
│       │   ├── database.js               # MongoDB Atlas connection with Mongoose
│       │   ├── cloudinary.js             # Cloudinary SDK initialization
│       │   ├── env.js                    # Centralized typed environment config
│       │   ├── multer.js                 # File upload storage strategy
│       │   └── swagger.js                # OpenAPI 3.0 Interactive Documentation
│       │
│       ├── core/
│       │   ├── constants/                # Application-wide constants
│       │   ├── errors/
│       │   │   └── AppError.js           # Custom error classes
│       │   ├── middleware/
│       │   │   ├── auth.middleware.js     # JWT token verification
│       │   │   ├── rateLimiter.middleware.js  # Hybrid Redis + Memory rate limiter
│       │   │   ├── rbac.middleware.js     # Role-Based Access Control
│       │   │   ├── sanitize.middleware.js # NoSQL injection and XSS protection
│       │   │   ├── security.middleware.js # HTTP security headers
│       │   │   └── error.middleware.js    # Centralized error handler
│       │   ├── response/
│       │   │   └── apiResponse.js        # Standardized API response formatter
│       │   └── utils/
│       │       └── regex.util.js         # Input validation regex patterns
│       │
│       ├── infrastructure/
│       │   ├── logger/
│       │   │   └── logger.js             # Winston structured logger + correlation IDs
│       │   ├── notifications/
│       │   │   └── notificationDispatcher.js # Multi-channel & email digest aggregator
│       │   ├── redis/
│       │   │   └── redisClient.js        # Redis client singleton
│       │   ├── queues/
│       │   │   └── emailQueue.js         # Zero-idle-polling async email queue
│       │   ├── email/
│       │   │   ├── emailService.js       # Nodemailer SMTP + HTML OTP templates
│       │   │   └── dnsValidator.js       # DNS MX record email verification
│       │   └── websocket/
│       │       └── socketGateway.js      # Socket.IO server and presence tracking
│       │
│       ├── modules/                      # 19 Domain Modules
│       │   ├── auth/
│       │   ├── users/
│       │   ├── profiles/
│       │   ├── posts/
│       │   ├── comments/
│       │   ├── connections/
│       │   ├── messaging/
│       │   ├── notifications/
│       │   ├── jobs/
│       │   ├── applications/
│       │   ├── search/
│       │   ├── admin/
│       │   ├── communities/
│       │   ├── events/
│       │   ├── saved/
│       │   ├── recommendations/
│       │   ├── settings/
│       │   ├── learning/
│       │   └── codecollab/
│       │
│       └── routes/
│           └── v1/
│               └── index.js              # API v1 route aggregator
│
├── frontend/                             # Next.js 16 + React 19 Frontend
│   ├── Dockerfile                        # Multi-stage standalone Next.js Docker image
│   ├── .dockerignore                     # Docker build context exclusions
│   ├── next.config.mjs                   # Next.js config (standalone, React Compiler)
│   ├── package.json                      # Dependencies: next, react, redux, axios, mui
│   │
│   └── src/
│       ├── pages/                        # Next.js Pages Router (20 routes)
│       │   ├── _app.js                   # App wrapper (Redux + Socket Providers)
│       │   ├── _document.js              # HTML head configuration
│       │   ├── index.jsx                 # Landing page
│       │   ├── login/index.jsx           # Login and Registration
│       │   ├── feed/                     # Social feed
│       │   ├── profile/                  # User profile editor
│       │   ├── view_profile/[username].jsx  # Public profile view
│       │   ├── messages/                 # Real-time messaging
│       │   ├── notifications/            # Notification center
│       │   ├── jobs/                     # Job listings
│       │   ├── myConnections/            # Network manager
│       │   ├── communities/              # Community groups
│       │   ├── events/                   # Events management
│       │   ├── saved/                    # Saved items
│       │   ├── settings/                 # Account settings
│       │   ├── dashboard/               # Analytics dashboard
│       │   ├── discover/                 # Discovery page
│       │   ├── learning/                 # Courses catalog
│       │   ├── courses/                  # Course details
│       │   └── code-collab/              # Live code collaboration
│       │
│       ├── components/                   # Reusable UI Components
│       │   ├── Navbar/                   # Top navigation bar
│       │   ├── Footer/                   # Page footer
│       │   └── FullPageLoader/           # Loading screen
│       │
│       ├── layout/                       # Page layout wrappers
│       ├── services/
│       │   └── apiClient.js              # Centralized Axios client (50+ API methods)
│       ├── config/
│       │   ├── index.jsx                 # App configuration
│       │   └── redux/
│       │       ├── store.js              # Redux Toolkit store
│       │       ├── action/
│       │       │   ├── userAction/        # Auth async thunks
│       │       │   └── postAction/        # Post CRUD async thunks
│       │       └── reducre/
│       │           ├── userReducer/       # Auth state slice
│       │           └── postReducer/       # Feed state slice
│       ├── context/
│       │   └── SocketContext.jsx          # React Context for Socket.IO
│       └── styles/                       # Global and module CSS
│
├── docker-compose.yml                    # Full-stack orchestration
├── Makefile                              # Developer convenience commands
└── .gitignore                            # Git exclusion rules
```

---

## 4. Backend Architecture

### 4.1 Server & Application Bootstrap

The backend starts in `server.js`:

```mermaid
graph TD
    Start["server.js"] --> DB["connectDatabase - MongoDB Atlas"]
    DB --> Redis["connectRedis - Upstash or Local"]
    Redis --> Worker["startEmailWorker - Background Queue"]
    Worker --> WS["socketGateway.initialize - WebSocket Server"]
    WS --> Listen["server.listen on port 3030"]
```

**Step-by-step startup sequence:**

1. **`server.js`** creates an HTTP server wrapping the Express `app`.
2. **`connectDatabase()`** from `src/config/database.js` connects to MongoDB Atlas using Mongoose. It uses connection string from the `MONGO_URI` environment variable.
3. **`connectRedis()`** from `src/infrastructure/redis/redisClient.js` opens a non-blocking TLS connection to Upstash Redis (or local Docker Redis). If Redis is unreachable, the server boots normally with in-memory fallbacks — zero downtime.
4. **`startEmailWorker()`** from `src/infrastructure/queues/emailQueue.js` initializes the background email queue consumer that listens for email jobs.
5. **`socketGateway.initialize(server)`** from `src/infrastructure/websocket/socketGateway.js` attaches the Socket.IO WebSocket server to the HTTP server.
6. The server starts listening on port `3030`.

---

### 4.2 Configuration & Environment

All environment variables are centralized in `src/config/env.js` and exported as a typed `ENV` object:

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `PORT` | Server port | `3030` |
| `MONGO_URI` | MongoDB Atlas connection string | Local MongoDB |
| `JWT_SECRET` | Access token signing secret | Dev-only fallback |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Dev-only fallback |
| `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` | Cloudinary media storage | Empty |
| `REDIS_URL` | Full Redis connection URL (Upstash TLS) | Empty |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Individual Redis params | `127.0.0.1:6379` |
| `REDIS_ENABLED` | Toggle Redis on/off | `true` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP credentials | Gmail defaults |

Actual secret values live in `backend/.env` which is **git-ignored** and never pushed to GitHub.

---

### 4.3 Core Middleware Pipeline

Every HTTP request passes through this middleware chain defined in `src/app.js`:

```mermaid
graph LR
    Request["Incoming HTTP Request"] --> A["securityHeaders"]
    A --> B["CORS Whitelist"]
    B --> C["Body Parser 15MB limit"]
    C --> D["sanitizeInputs"]
    D --> E["generalApiLimiter 300 per 15min"]
    E --> F["API v1 Router"]
    F --> G["Module Controller"]
    G --> H["errorHandler"]
    H --> Response["JSON Response"]
```

| Middleware | File | What It Does |
| :--- | :--- | :--- |
| **Security Headers** | `security.middleware.js` | Sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and CSP headers. This is equivalent to what the Helmet library does, but implemented manually without the dependency. |
| **CORS** | `app.js` | Strict origin whitelist that only allows requests from `localhost:3000`, Vercel deployments, and Render domains. All other origins are rejected. |
| **Body Parser** | `app.js` | `express.json({ limit: "15mb" })` — Parses JSON request bodies with a 15MB limit to support media uploads. |
| **Input Sanitizer** | `sanitize.middleware.js` | Recursively walks through every field in `req.body`, `req.params`, and `req.query` and strips dangerous characters like `$`, `{`, `}`, and `<script>` tags to prevent NoSQL injection and cross-site scripting (XSS) attacks. |
| **Rate Limiter** | `rateLimiter.middleware.js` | Uses Redis sorted sets to enforce a sliding window rate limit per IP address. Falls back to in-memory `Map()` when Redis is offline. See Section 8.2 for details. |
| **Auth Middleware** | `auth.middleware.js` | Verifies the JWT Bearer token from the `Authorization` header. Decodes the token, looks up the user in MongoDB, and injects `req.user` with the full user document. |
| **RBAC** | `rbac.middleware.js` | Checks `req.user.role` against the required role for the endpoint. Returns `403 Forbidden` if the user lacks permissions. |
| **Error Handler** | `error.middleware.js` | Catches all unhandled errors from controllers/services and returns a standardized JSON error response with the correct HTTP status code. |

---

### 4.4 Module Architecture

Each backend domain module follows the **Controller → Service → Repository** pattern, which separates HTTP handling from business logic from database access:

```mermaid
graph LR
    Route["Express Route Definition"] --> Controller["Controller - HTTP Layer"]
    Controller --> Service["Service - Business Logic"]
    Service --> Repository["Repository - Database Queries"]
    Repository --> Model["Mongoose Model"]
    Model --> MongoDB[("MongoDB Atlas")]
```

| Layer | Responsibility | Example (Auth Module) |
| :--- | :--- | :--- |
| **Routes** (`*.routes.js`) | Define HTTP endpoints and attach middleware (auth, RBAC, rate limiting) | `router.post("/login", authRateLimiter, authController.login)` |
| **Controller** (`*.controller.js`) | Parse request data from `req.body` / `req.params`, call the service, and send the response via `res.json()` | Extract `email` and `password` from `req.body`, call `authService.login()` |
| **Service** (`*.service.js`) | Contains all core business logic, validation, and orchestration between multiple repositories | Verify password hash with `bcrypt.compare()`, generate JWT tokens, send OTP email |
| **Repository** (`*.repository.js`) | Raw database queries via Mongoose methods | `User.findOne({ email })`, `User.create(userData)` |
| **Model** (`*.model.js`) | Mongoose schema definition with fields, types, indexes, virtuals, and pre-save hooks | `name: { type: String, required: true }`, `pre("save", hashPassword)` |

---

### 4.5 All 19 Backend Modules Explained

#### 1. Auth Module (`modules/auth/`)
**Route Prefix:** `/api/v1/auth`

The authentication module handles the complete user identity lifecycle. When a user registers, it first validates their email domain by performing a real-world DNS MX record lookup (`dnsValidator.js`) to ensure the email domain actually exists and can receive mail. Then it generates a 6-digit OTP, stores it in MongoDB with a 10-minute expiry, and enqueues an email job via the Redis email queue. The email is delivered asynchronously in the background while the API responds instantly. Once the user verifies the OTP, registration completes with JWT token generation.

Login uses `bcrypt.compare()` to verify the password against the stored hash, then generates an access token (7-day expiry) and refresh token (30-day expiry). Google OAuth is also supported for social login.

**Key endpoints:** `POST /register`, `POST /login`, `POST /google`, `POST /send-otp`, `POST /verify-otp`, `POST /verify-dns`, `GET /check-username`, `GET /me`, `POST /avatar`

#### 2. Users Module (`modules/users/`)
An internal module (not directly exposed via routes). Contains the `User` Mongoose model and a shared repository for looking up users by email, username, or MongoDB ID. Used internally by the auth, profile, and admin modules.

#### 3. Profiles Module (`modules/profiles/`)
**Route Prefix:** `/api/v1/profiles`

Manages detailed professional profiles linked 1-to-1 with user accounts. Profiles include headline, bio, current position, skills array, work experience array, education array, certifications, and portfolio links. The `GET /profiles/:username` endpoint is public and renders the "view profile" page for any user.

**Key endpoints:** `GET /me`, `PUT /me`, `GET /:username`, `GET /all`

#### 4. Posts Module (`modules/posts/`)
**Route Prefix:** `/api/v1/posts`

The social feed engine. Users can create text posts with optional media (images/videos uploaded to Cloudinary). Posts support likes, dislikes, and hashtag extraction. The feed endpoint `GET /posts` returns paginated results sorted by creation date, with skip/limit query parameters.

When a user creates a post with an image, Multer parses the `multipart/form-data` upload, the file is uploaded to Cloudinary's CDN, and the returned secure URL is stored in the MongoDB post document.

**Key endpoints:** `GET /`, `POST /`, `DELETE /:id`, `POST /:id/like`, `POST /:id/dislike`

#### 5. Comments Module (`modules/comments/`)
**Route Prefix:** `/api/v1/comments`

Supports threaded comments on posts. Each comment links to a `postId` and optionally a `parentComment` for nested reply threads. Comments trigger notifications to the post author via the notifications module.

**Key endpoints:** `GET /post/:postId`, `POST /`, `DELETE /:id`

#### 6. Connections Module (`modules/connections/`)
**Route Prefix:** `/api/v1/connections`

Professional networking logic. Users send connection requests which are stored with status `pending`. The recipient can accept or reject. Accepted connections are bidirectional — both users appear in each other's connection lists. Connection requests trigger real-time Socket.IO notifications.

**Key endpoints:** `POST /request`, `POST /respond`, `GET /my`

#### 7. Messaging Module (`modules/messaging/`)
**Route Prefix:** `/api/v1/messages`

Real-time 1-on-1 messaging system. Users first create a `Conversation` with a recipient, then exchange `Message` documents within that conversation. Messages are persisted to MongoDB for history and simultaneously broadcast via Socket.IO for instant delivery.

The messaging controller also integrates with the Socket.IO gateway to emit `new_message` events to the recipient's personal room, enabling real-time message delivery without polling.

**Key endpoints:** `GET /conversations`, `POST /conversations`, `GET /conversations/:id/messages`, `POST /messages`

#### 8. Notifications Module (`modules/notifications/`)
**Route Prefix:** `/api/v1/notifications`

Centralized notification system. Other modules (connections, comments, messaging, jobs) create notification records in MongoDB. The frontend fetches notifications via REST and receives real-time push notifications via Socket.IO.

**Key endpoints:** `GET /`, `PATCH /:id/read`, `PATCH /read-all`

#### 9. Jobs Module (`modules/jobs/`)
**Route Prefix:** `/api/v1/jobs`

Full job listing management. Recruiters create job posts with title, company, location, job type (full-time, part-time, contract, internship), salary range, and required experience level. Job seekers search and filter listings.

**Key endpoints:** `GET /`, `GET /:id`, `POST /`

#### 10. Applications Module (`modules/applications/`)
**Route Prefix:** `/api/v1/applications`

Complete application lifecycle management. Job seekers submit applications with resume data. Applications move through a status pipeline: `Applied → Screening → Shortlisted → Interview → Offer → Hired` (or `Rejected` at any stage). Recruiters manage applicant status transitions.

**Key endpoints:** `POST /`, `GET /my`

#### 11. Search Module (`modules/search/`)
**Route Prefix:** `/api/v1/search`

Global search across all entities. A single query parameter `q` searches through users (name, username), posts (text content), jobs (title, company), and communities (name, description) simultaneously using MongoDB `$regex` queries.

**Key endpoints:** `GET /?q=keyword`

#### 12. Admin Module (`modules/admin/`)
**Route Prefix:** `/api/v1/admin`

Admin-only dashboard for platform management. Protected by RBAC middleware requiring `admin` role. Features include user management (view all users, suspend accounts), content moderation (remove inappropriate posts), and platform analytics.

#### 13. Communities Module (`modules/communities/`)
**Route Prefix:** `/api/v1/communities`

Group functionality with community creation, membership management, moderator assignment, group messaging with upvote/downvote system, and community-specific image uploads. Community messages support voting (upvote/downvote) for quality content surfacing.

**Key endpoints:** `GET /`, `GET /:id`, `POST /`, `POST /:id/membership`, `PUT /:id/settings`, `POST /:id/moderators`, `GET /:id/messages`, `POST /:id/messages`, `POST /:id/messages/:messageId/vote`, `DELETE /:id/messages/:messageId`

#### 14. Events Module (`modules/events/`)
**Route Prefix:** `/api/v1/events`

Event creation, discovery, and RSVP management. Users can create professional events (workshops, meetups, webinars), other users can browse and RSVP.

#### 15. Saved Module (`modules/saved/`)
**Route Prefix:** `/api/v1/saved`

Bookmark functionality. Users can save posts, jobs, and events for later viewing. Saved items are persisted per-user in MongoDB.

#### 16. Recommendations Module (`modules/recommendations/`)
**Route Prefix:** `/api/v1/recommendations`

People and content recommendation engine. Suggests connections based on shared skills, mutual connections, and industry. Suggests posts based on engagement patterns.

#### 17. Settings Module (`modules/settings/`)
**Route Prefix:** `/api/v1/settings`

Account settings management including profile privacy controls, notification preferences (email, push, in-app), and password change.

#### 18. Learning Module (`modules/learning/`)
**Route Prefix:** `/api/v1/learning`

Course catalog with learning paths and progress tracking. Users can browse courses, enroll, and track completion status.

#### 19. Code Collaboration Module (`modules/codecollab/`)
**Route Prefix:** `/api/v1/codecollab`

Live pair programming rooms. Users create collaboration sessions with a selected programming language (JavaScript, Python, Go), share a room link, and write code together in real-time. Changes are synchronized via Socket.IO events.

---

### 4.6 API Versioning & Route Map

All v2 routes are aggregated in `src/routes/v1/index.js` and mounted at `/api/v1` in `src/app.js`:

```text
/api/v1/auth          → Auth module (register, login, OTP, Google OAuth)
/api/v1/profiles      → Profile module (CRUD, portfolio)
/api/v1/posts         → Posts module (feed, create, like/dislike)
/api/v1/comments      → Comments module (add, delete, threads)
/api/v1/connections   → Connections module (request, accept, list)
/api/v1/messages      → Messaging module (conversations, messages)
/api/v1/notifications → Notifications module (list, read, read-all)
/api/v1/jobs          → Jobs module (listings, search, filters)
/api/v1/applications  → Applications module (apply, track lifecycle)
/api/v1/search        → Search module (global search)
/api/v1/admin         → Admin module (moderation, user management)
/api/v1/communities   → Communities module (groups, discussions)
/api/v1/events        → Events module (create, RSVP, discover)
/api/v1/saved         → Saved module (bookmarks)
/api/v1/recommendations → Recommendations module
/api/v1/settings      → Settings module (account, privacy)
/api/v1/learning      → Learning module (courses, progress)
/api/v1/codecollab    → Code Collaboration module (live rooms)
```

Legacy v1 routes (`/register`, `/login`, `/addpost`, etc.) are preserved in `backend/routes/` for full backwards compatibility.

---

## 5. Frontend Architecture

### 5.1 Next.js Pages & Routing

The frontend uses the **Next.js Pages Router** with 20 distinct page routes defined in `frontend/src/pages/`:

| Page Route | File | Purpose |
| :--- | :--- | :--- |
| `/` | `index.jsx` | Social feed timeline with post composer directly at top and instant post creation |
| `/login` | `login/index.jsx` | Login and Registration with OTP verification modal |
| `/feed` | `feed/` | Social post feed (scrollable timeline with create post) |
| `/feed/topic/[tag]` | `feed/topic/[tag].jsx` | Hashtag-filtered trending topic feed |
| `/profile` | `profile/` | Edit your own professional profile |
| `/view_profile/[username]` | `view_profile/[username].jsx` | View any user's public portfolio (dynamic route) |
| `/messages` | `messages/` | Real-time 1-on-1 messaging dashboard |
| `/notifications` | `notifications/` | Notification center with read/unread management |
| `/jobs` | `jobs/` | Job listings with search and filters |
| `/myConnections` | `myConnections/` | Manage your professional network |
| `/communities` | `communities/` | Community groups list and detail view |
| `/events` | `events/` | Events discovery and management |
| `/saved` | `saved/` | Saved posts, jobs, and events |
| `/settings` | `settings/` | Account and privacy settings |
| `/dashboard` | `dashboard/` | Analytics and activity dashboard |
| `/discover` | `discover/` | People and content discovery |
| `/learning` | `learning/` | Course catalog and learning modules |
| `/courses` | `courses/` | Individual course detail pages |
| `/code-collab` | `code-collab/index.jsx` | Full LeetCode-style technical interview & coding sandbox with live WebSocket sync |

---

### 5.2 State Management (Redux Toolkit)

Global client state is managed via **Redux Toolkit** configured in `frontend/src/config/redux/store.js`:

```text
Redux Store
├── auth (userReducer)     → Login state, current user, JWT token, loggedIn flag
└── posts (postReducer)    → Feed posts array, loading states, pagination
```

**How the Redux flow works:**

1. **Async Thunks** (in `action/userAction/` and `action/postAction/`) are created with `createAsyncThunk`. These dispatch API calls via the Axios client.
2. **`loginUser(credentials)`** → Calls `POST /auth/login`, stores the JWT token in `localStorage`, and updates the Redux `auth` state with the user object.
3. **`registerUser(data)`** → Calls `POST /auth/register`, auto-logs in on success by dispatching the same token storage.
4. **`fetchAllPosts(params)`** → Calls `GET /posts` with pagination parameters, populates the `posts` state array.
5. **`createNewPost(formData)`** → Calls `POST /posts` with form data including optional image, prepends the new post to the feed state.
6. **Reducers** (in `reducre/userReducer/` and `reducre/postReducer/`) handle the state transitions for `pending`, `fulfilled`, and `rejected` states of each thunk.

---

### 5.3 API Client & Axios Interceptors

All 50+ API calls are centralized in `frontend/src/services/apiClient.js`:

**How it works:**
1. An Axios instance (`apiClient`) is created with a `baseURL` pointing to `NEXT_PUBLIC_API_URL/api/v1`.
2. A **request interceptor** automatically reads the JWT token from `localStorage` on every outgoing request and injects it as `Authorization: Bearer <token>` header.
3. The `api` object exposes categorized methods organized by domain: `api.login()`, `api.getAllPosts()`, `api.sendMessage()`, `api.getJobs()`, `api.searchGlobal()`, `api.getCommunities()`, etc.
4. Each method returns an Axios promise that resolves with the API response data.

**API method categories:**
- **Auth (8 methods):** login, register, googleAuth, checkEmailDns, checkUsername, sendEmailOtp, verifyEmailOtp, getMe, uploadAvatar
- **Profiles (4 methods):** getMyProfile, getProfileByUsername, updateProfile, getAllProfiles
- **Posts (5 methods):** getAllPosts, createPost, deletePost, likePost, dislikePost
- **Comments (3 methods):** getComments, addComment, deleteComment
- **Connections (3 methods):** sendConnectionRequest, getMyConnections, respondToConnection
- **Messaging (4 methods):** getConversations, startConversation, getMessages, sendMessage
- **Notifications (3 methods):** getNotifications, markNotificationRead, markAllNotificationsRead
- **Jobs (3 methods):** getJobs, getJobById, createJob
- **Applications (2 methods):** applyForJob, getMyApplications
- **Search (1 method):** searchGlobal
- **Communities (10 methods):** getCommunities, getCommunityById, createCommunity, toggleMembership, joinCommunity, updateSettings, manageModerator, getMessages, sendMessage, voteCommunityMessage, deleteCommunityMessage, uploadCommunityImage

---

### 5.4 Real-Time Socket Context

WebSocket connectivity is managed via a React Context in `frontend/src/context/SocketContext.jsx`:

**How it works:**
1. When the app mounts, `SocketContext` creates a persistent Socket.IO client connection to `NEXT_PUBLIC_SOCKET_URL`.
2. The JWT token is passed via `socket.handshake.auth.token` so the server can authenticate the WebSocket connection.
3. The socket instance is provided to all child components via React's `useContext(SocketContext)`.
4. Components that need real-time updates (messaging page, notification center, code collab rooms) consume the socket instance and listen for events.

**Socket events used:**
- `new_message` — Received when someone sends you a message
- `new_notification` — Received for likes, comments, connection requests
- `user_status` — Broadcasts `ONLINE`/`OFFLINE` presence updates
- `typing_start` / `typing_stop` — Typing indicator events in conversations
- `code_change` — Synchronized code edits in collaboration rooms

---

### 5.5 UI Components & Layout System

| Component | Path | Purpose |
| :--- | :--- | :--- |
| **Navbar** | `components/Navbar/` | Top navigation bar with logo, search bar, profile avatar, notification badge with unread count, and navigation links |
| **Footer** | `components/Footer/` | Page footer with site links and copyright |
| **FullPageLoader** | `components/FullPageLoader/` | Full-screen loading spinner displayed during initial auth verification |
| **Layout** | `layout/` | Dashboard page wrapper with sidebar navigation for authenticated pages |

**Styling approach:**
- **Material UI (MUI)** components for form elements, buttons, cards, dialogs, and responsive grids
- **CSS Modules** (e.g., `login/style.module.css`) for page-specific scoped styles
- **Global styles** in `styles/` for app-wide typography and theme

---

### 5.6 Code Collab 2.0 (LeetCode IDE Architecture)

Files: `frontend/src/pages/code-collab/index.jsx`, `codeHighlight.js`, `codeCollab.module.css`

The Code Collab module is an in-platform technical screening, algorithmic problem-solving, and live pair programming suite modeled after the **LeetCode Dark UI** and powered by a dual-layer synchronization and syntax engine.

#### A. LeetCode Split Workspace Layout
- **Dedicated LeetCode Top Bar:**
  - Back button `<` linking to the ProConnect social feed.
  - Problem Selector dropdown (*1. Two Sum*, *20. Valid Parentheses*, *146. LRU Cache*) with `<` and `>` problem navigators.
  - `▶ Run` (Dark pill) and `✓ Submit` (LeetCode green `#2cbb5d`) buttons.
  - Room invite pill (`🔗 room-alpha-98`), One-click `Share` button, `BETA` badge, and live peer indicator (`● 2,212 Online`).
- **Left Panel (Problem Specification):**
  - Tabs: `Description` | `Editorial` | `Solutions` | `Submissions`.
  - Difficulty badges (`Easy` green, `Medium` amber, `Hard` red), `Solved ✓` indicator, `🏷️ Topics`, `🔒 Companies`, `💡 Hint`.
  - Problem text with syntax code spans (`nums`, `target`), formatted Example cards (`Input:`, `Output:`, `Explanation:`), and Constraints block.
  - Social footer bar (`👍 70.1K`, `👎`, `💬 2.1K`, `⭐`).
- **Right Panel (Two-Tier Split):**
  - **Top:** `</> Code` editor with Language Selector (`JavaScript`, `TypeScript`, `Python3`), `Copy`, `Reset`, line gutter, and status bar (`Saved` • `Ln X, Col Y`).
  - **Bottom:** `☑ Testcase` | `>_ Test Result` | `💬 In-Room Chat` tabs displaying test case parameters, expected outputs, runtime latency in milliseconds ($ms$), memory usage, and assertion diffs.

#### B. Monaco/VS Code-Style Syntax Tokenizer (`codeHighlight.js`)
Rather than plain textarea text, Code Collab utilizes a synchronized dual-layer editor canvas:
- **Layer 1 (Behind):** Syntax-highlighted `<pre><code>` container parsed by `highlightCodeToHtml()`.
- **Layer 2 (In Front):** High-performance transparent `<textarea>` with `caret-color: #38bdf8`.
- **Color Tokenization Map:**
  - Keywords (`class`, `function`, `const`, `let`, `var`, `return`, `if`, `else`, `def`, `self`): VS Code Magenta `#c586c0`
  - Built-in Types (`number`, `string`, `boolean`, `void`, `Map`, `Set`, `Array`, `vector`, `int`): Teal `#4ec9b0`
  - Strings (`"..."`, `'...'`, `` `...` ``): Salmon/Orange `#ce9178`
  - Comments (`//...`, `/*...*/`, `#...`): Green Italic `#6a9955`
  - Numbers (`0-9`): Light Green `#b5cea8`
  - Function Invocations (`twoSum(...)`, `isValid(...)`): Yellow `#dcdcaa`
  - Rainbow Bracket Pairs: Yellow `#ffd700`, Purple `#da70d6`, Blue `#179fff`
  - Variables & Identifiers: Sky Blue `#9cdcfe`

#### C. Smart Indentation & Auto-Closing Brackets Engine
- **Pair Auto-Closing:** Typing `(`, `[`, `{`, `"`, `'`, or `` ` `` automatically inserts the matching closing character and positions the caret inside.
- **Selection Wrapping:** Highlighting code and typing an opening bracket wraps the selection.
- **Step-Over:** Typing `)`, `]`, or `}` when immediately preceding that character steps over it without duplicate insertion.
- **Pair Backspace:** Pressing Backspace between an empty pair `()` or `[]` or `{}` deletes both characters simultaneously.
- **Block Enter Expansion:** Pressing Enter between `{}` automatically formats:
  ```javascript
  {
    |
  }
  ```
- **Indentation Preservation:** Pressing Enter on an indented line preserves whitespace indentation.
- **Tab Key:** Inserts 2 spaces without losing editor focus.

#### D. In-Browser Sandboxed Test Runner
- JavaScript & TypeScript: Evaluated in a client-side sandbox via isolated function boundaries with `try...catch` error trapping.
- Compares student outputs against expected test cases with deep assertion verification.
- Measures execution time using high-resolution timers (`performance.now()`).

#### E. Dual-Engine Real-Time Synchronization
1. **`BroadcastChannel` API (`proconnect_collab_${roomId}`):**
   - Connects any tabs or windows opened on the same browser/machine with **$<1\text{ ms}$ zero-network latency**.
   - Keystrokes, language changes, problem selections, and test runs synchronize instantly across windows.
2. **Socket.IO Room Gateway (`backend/src/infrastructure/websocket/socketGateway.js`):**
   - Connects remote interviewers and candidates across different machines.
   - `join_code_room`: Registers participant with Host or Candidate role.
   - `code_init_state`: Automatically delivers the current code buffer to newly joined peers.
   - `code_change`: Relays debounced edits to all other peers in `code_room:${roomId}`.
   - `code_run`: Broadcasts execution activity indicator (`"Peer is running tests..."`).
   - `code_chat_message`: Delivers in-room live chat messages.

---

## 6. Database Layer

**MongoDB Atlas** is used as the single source of truth for all persistent data, accessed via **Mongoose ODM**.

### Connection

`src/config/database.js` connects to MongoDB Atlas using the `MONGO_URI` connection string. Mongoose connection events log successful connections and handle errors gracefully.

### Key Data Models

| Model | Location | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| `User` | `modules/users/` or `models/userSchema.js` | name, email, username, password (bcrypt), role, token, isEmailVerified | Core identity |
| `Profile` | `modules/profiles/` or `models/profileSchema.js` | userId, headline, bio, skills[], experience[], education[], certifications[] | Professional info |
| `Post` | `modules/posts/` or `models/postsSchema.js` | userId, text, media (Cloudinary URL), likes[], dislikes[], hashtags[] | Social feed content |
| `Comment` | `modules/comments/` or `models/commentsSchema.js` | userId, postId, text, parentComment (for nesting) | Post comments |
| `Connection` | `modules/connections/` or `models/connectionsSchema.js` | senderId, receiverId, status (pending/accepted/rejected) | Network links |
| `Conversation` | `modules/messaging/` | participants[], lastMessage, updatedAt | Chat threads |
| `Message` | `modules/messaging/` | conversationId, senderId, text, readBy[] | Chat messages |
| `Notification` | `modules/notifications/` | userId, type, message, isRead, relatedEntity | Alert records |
| `Job` | `modules/jobs/` | title, company, location, type, salary, experienceLevel, postedBy | Job listings |
| `Application` | `modules/applications/` | jobId, applicantId, status, resume, coverLetter | Job applications |
| `Community` | `modules/communities/` | name, description, creator, members[], moderators[], messages[] | Group communities |
| `Event` | `modules/events/` | title, description, date, location, organizer, attendees[] | Professional events |
| `EmailVerification` | `modules/auth/` | email, otp (6-digit), expiresAt, verified, attempts | OTP verification |
| `CodeCollabSession` | `modules/codecollab/` | sessionId, title, language, code, participants[], creator | Code rooms |

---

## 7. Authentication & Security

### 7.1 JWT Dual-Token System

**How login works step by step:**

1. User enters email and password on the login page.
2. Frontend calls `POST /api/v1/auth/login` with credentials.
3. Backend looks up the user by email in MongoDB.
4. Backend uses `bcrypt.compare()` to verify the submitted password against the stored hash.
5. If valid, backend generates two JWT tokens:
   - **Access Token** (7-day expiry): Used for API authentication on every request.
   - **Refresh Token** (30-day expiry): Used to obtain a new access token without re-entering password.
6. Backend returns `{ accessToken, refreshToken, user }`.
7. Frontend stores the access token in `localStorage`.
8. The Axios interceptor automatically attaches `Authorization: Bearer <token>` to every subsequent API request.
9. On the server, `auth.middleware.js` verifies the token signature and expiry using `jwt.verify()`, then injects `req.user` with the decoded user data.

---

### 7.2 Email OTP Verification Pipeline

This is the most complex flow in the application, involving 6 different files working together:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Login Page
    participant Backend as auth.service.js
    participant DNS as dnsValidator.js
    participant Queue as emailQueue.js
    participant Redis as Upstash Redis
    participant Worker as Queue Worker
    participant SMTP as Gmail SMTP
    participant Inbox as Users Email

    User->>Frontend: Fill name, email, password, click Get Code
    Frontend->>Backend: POST /auth/send-otp with email and name
    Backend->>DNS: Verify email domain via DNS MX lookup
    DNS-->>Backend: Domain valid, gmail.com has MX records
    Backend->>Backend: Generate 6-digit OTP, save to MongoDB with 10min TTL
    Backend->>Queue: enqueueEmail with to, name, otp
    Queue->>Redis: LPUSH queue:email with job JSON
    Queue-->>Backend: enqueued true, status queued
    Backend-->>Frontend: 200 OK, Verification code sent, response in 20ms
    Frontend->>Frontend: Show OTP input modal

    Note over Worker, Inbox: Background processing, async, non-blocking
    Queue-)Worker: emit new_job event
    Worker->>Redis: RPOP queue:email
    Redis-->>Worker: Job JSON
    Worker->>SMTP: sendMail with to, subject, html
    SMTP->>Inbox: Deliver OTP email

    User->>Frontend: Enter 6-digit code, click Verify
    Frontend->>Backend: POST /auth/verify-otp with email and otp
    Backend->>Backend: Compare OTP, check expiry and attempts
    Backend-->>Frontend: 200 OK, Email verified
    Frontend->>Backend: POST /auth/register with name email username password
    Backend-->>Frontend: accessToken and user, Auto-login
```

**Files involved:**
- `auth.service.js` — `sendVerificationOtp()`, `verifyOtp()`, `register()` business logic
- `emailQueue.js` — `enqueue()` pushes to Redis, `processJobs()` consumes from Redis
- `emailService.js` — `sendVerificationOtpEmail()` builds HTML email template and sends via Nodemailer
- `dnsValidator.js` — `verifyEmailRealWorldDns()` performs actual DNS MX record lookups

---

### 7.3 Role-Based Access Control

Enforced by `rbac.middleware.js`:

| Role | Permissions |
| :--- | :--- |
| **User** | Create posts, apply to jobs, send messages, join communities, save items |
| **Recruiter** | All User permissions + Create job listings, manage applicants, track applications |
| **Company Admin** | All Recruiter permissions + Company page management |
| **Moderator** | Content moderation, community management, remove inappropriate content |
| **Admin** | Full system access, user management, platform analytics, ban users |

The RBAC middleware is applied per-route. For example, job creation routes require `recruiter` or `admin` role, while admin dashboard routes require `admin` role.

---

### 7.4 Security Middleware Stack

| Layer | Attack Prevented | How It Works |
| :--- | :--- | :--- |
| **Security Headers** | Clickjacking, MIME sniffing, XSS | Sets `X-Frame-Options: DENY` (prevents embedding in iframes), `X-Content-Type-Options: nosniff` (prevents MIME type sniffing), `Strict-Transport-Security` (forces HTTPS) |
| **CORS Whitelist** | Cross-origin attacks | Only allows requests from specific frontend origins. Rejects all other domains. |
| **Input Sanitization** | NoSQL Injection, Stored XSS | Recursively strips `$` operators (used in MongoDB injection), curly braces, and `<script>` tags from every input field |
| **Rate Limiting** | DoS, Brute-Force, Credential Stuffing | Redis-backed sliding window limits requests per IP (see Section 8.2) |
| **JWT Verification** | Unauthorized access | Every protected endpoint verifies token signature and checks expiry |
| **Bcrypt Hashing** | Password theft from DB breach | Passwords are hashed with `bcrypt` salt rounds; even if the database is compromised, passwords cannot be recovered |
| **DNS Email Validation** | Fake/disposable emails | Performs real MX record lookups to verify the email domain can actually receive mail |
| **Payload Limits** | Resource exhaustion | Request body limited to 15MB to prevent oversized uploads from crashing the server |

---

## 8. Redis Infrastructure

### 8.1 Redis Client Singleton

File: `src/infrastructure/redis/redisClient.js`

Uses the **official `redis` package** (node-redis v6) with resilient connection management:

- **Lazy Connect:** The `connect()` call is non-blocking. If Redis is unreachable at startup, the server continues with in-memory fallbacks.
- **Exponential Backoff Reconnect:** Retries up to 5 times with increasing delays (capped at 2 seconds), then stops attempting to prevent CPU spin-loops.
- **Safe Error Handling:** Catches `ECONNREFUSED` and similar network errors, logs a single clean warning instead of flooding the console with repeated error messages.
- **TLS Support:** Connects to Upstash Cloud Redis using the `rediss://` protocol (note the double-s for TLS).
- **Exported Utilities:** `getRedisClient()` returns the singleton, `connectRedis()` initializes the connection, `isRedisReady()` returns a boolean for health checks, `getRedisStatus()` returns detailed connection info.

---

### 8.2 Distributed Rate Limiting

File: `src/core/middleware/rateLimiter.middleware.js`

**How the Hybrid Sliding Window works:**

```mermaid
graph TD
    Request["Incoming Request from IP: 192.168.1.1"] --> Check{"Is Redis Ready?"}
    
    Check -->|Yes| RedisPath["Redis Atomic Transaction via MULTI"]
    RedisPath --> ZREM["ZREMRANGEBYSCORE key 0 windowStart: Remove expired timestamps"]
    ZREM --> ZADD["ZADD key timestamp:random: Record this request"]
    ZADD --> ZCARD["ZCARD key: Count requests in window"]
    ZCARD --> EXPIRE["PEXPIRE key windowMs: Auto-cleanup TTL"]
    EXPIRE --> Decision{"Count greater than Max?"}
    
    Check -->|No| MemoryPath["In-Memory Map Fallback: Same logic using JavaScript Map"]
    MemoryPath --> Decision
    
    Decision -->|Under Limit| Allow["next - Route Handler proceeds"]
    Decision -->|Over Limit| Block["429 Too Many Requests with retryAfterSeconds"]
```

**Why Sliding Window?** A fixed window (e.g., "100 requests per 15 minutes starting at :00") has a vulnerability: a user can make 100 requests at 14:59 and another 100 at 15:01, effectively getting 200 requests in 2 minutes. The sliding window tracks the exact timestamp of each request, so the count always reflects the actual trailing 15-minute window.

**Redis Implementation:** Uses Redis Sorted Sets (ZSET) where each member is a unique request ID and the score is the timestamp. `ZREMRANGEBYSCORE` prunes old entries, `ZADD` records new requests, `ZCARD` counts active entries — all executed atomically via `MULTI`/`EXEC`.

**4 Rate Limiter Tiers:**

| Limiter | Max Requests | Window | Applied To |
| :--- | :--- | :--- | :--- |
| `authRateLimiter` | 15 | 15 minutes | Login, register, OTP endpoints (prevents brute-force) |
| `generalApiLimiter` | 300 | 15 minutes | All API endpoints (prevents DoS) |
| `aiRateLimiter` | 25 | 15 minutes | AI Career Coach endpoints (expensive compute) |
| `writeRateLimiter` | 60 | 15 minutes | Post/comment creation (prevents spam) |

**Graceful Degradation:** When Redis is offline, the middleware instantly falls back to an in-memory `Map()` engine without dropping the request or failing open. The rate limiting continues to work per-process, just not distributed across containers. This guarantees zero downtime.

---

### 8.3 Asynchronous Email Queue

File: `src/infrastructure/queues/emailQueue.js`

**Why not BullMQ?** BullMQ uses Redis `BRPOP` (blocking pop) which constantly polls Redis every few milliseconds, even when the queue is empty. On Upstash's command-metered free tier (10,000 commands/day), idle polling alone would consume thousands of commands per hour, exhausting the daily quota without sending a single email.

**Our Event-Driven Design (Zero Idle Commands):**

| State | Redis Commands Used | Behavior |
| :--- | :--- | :--- |
| **Idle (no emails to send)** | 0 commands | Completely silent, no polling, no heartbeat |
| **Email Enqueued** | 1 `LPUSH` command | Job pushed to `queue:email` list, EventEmitter fires `new_job` |
| **Worker Processing** | 1 `RPOP` per job | Worker pops jobs in a loop until queue is empty, then sleeps |
| **Failed Job** | 1 `LPUSH` to retry queue | Up to 3 retry attempts with exponential backoff |
| **Dead Letter** | 1 `LPUSH` to DLQ | After 3 failures, job moves to `queue:email:dlq` |
| **Passive Sweep** | 1 `RPOP` every 5 min | Catches orphaned jobs from server restarts |

**Performance Impact:**
- **Before (synchronous email):** OTP endpoint response time ~2,400ms (waiting for SMTP handshake, DNS resolution, and email delivery).
- **After (async queue):** OTP endpoint response time **~20ms** — a **120x improvement**. The user sees "Verification code sent!" almost instantly, while the actual email delivers in the background.

**Offline Fallback:** If Redis is completely down, `enqueue()` detects this and sends the email directly via SMTP (synchronous). The response is slower (~2s) but the email still delivers. The user experience degrades gracefully instead of breaking.

---

### 8.4 Enterprise Cache-Aside Layer & Pattern Invalidation

File: `src/infrastructure/cache/cacheService.js`

To accelerate read-heavy bottlenecks while eliminating the classic **Cache Invalidation Problem**, ProConnect employs an enterprise-grade **Cache-Aside (Lazy Loading)** architecture featuring dual-tier fallback and automated pattern-based invalidation.

```mermaid
graph TD
    Client["Client / API Consumer"] --> Router["Express Route Handler"]
    Router --> CheckCache{"CacheService.get(key)"}
    
    CheckCache -->|Cache HIT| ReturnCached["Inject Header 'X-Cache: HIT'<br/>Return Cached JSON (1-3ms)"]
    CheckCache -->|Cache MISS| QueryDB["Query MongoDB Primary Replica (15-60ms)"]
    
    QueryDB --> Populate["CacheService.set(key, data, TTL)"]
    Populate --> ReturnDB["Inject Header 'X-Cache: MISS'<br/>Return Fresh Data"]
    
    Mutation["Post / Comment / Profile Mutation"] --> MutateDB["Write to MongoDB"]
    MutateDB --> Invalidate["CacheService.delPattern('cache:feed:*')<br/>SCAN & Atomic Deletion"]
```

#### 1. Cache Key Taxonomy & TTL Policies:
| Cache Domain | Key Pattern | Default TTL | Invalidation Triggers |
| :--- | :--- | :--- | :--- |
| **Social Feeds** | `cache:feed:*` (e.g. `cache:feed:page=1:limit=10`) | 300s (5 min) | New post created, post deleted, post liked, comment added |
| **User Profiles** | `cache:profile:{userId_or_username}` | 900s (15 min) | Profile headline, bio, experience, skills updated |

#### 2. Pattern-Based Invalidation (`SCAN` + Multi-Delete):
Unlike naive cache engines that flush the entire cache on writes, `CacheService.delPattern(pattern)` uses Redis `SCAN` with cursor batching (100 keys per iteration). This prevents Redis single-threaded blocking while ensuring zero stale feed entries when any user creates or likes a post.

#### 3. Dual-Engine Resilience (Redis + In-Memory LRU Fallback):
If Redis is temporarily disconnected or offline:
- All cache operations transparently fall back to an in-memory `Map` cache with local TTL expiration.
- Memory cache capacity is bounded to prevent heap overflow.
- If both Redis and memory cache fail, operations fail silently without breaking the request lifecycle, ensuring 100% database query continuity.

#### 4. Observability & Cache Telemetry:
- Every cached route injects an `X-Cache: HIT` or `X-Cache: MISS` HTTP header for client-side and CDN observability.
- `CacheService.getTelemetry()` tracks cumulative hits, misses, and hit ratio percentages in real time.

---

## 9. Real-Time Communication

File: `src/infrastructure/websocket/socketGateway.js`

**How Socket.IO is set up:**

1. When the HTTP server starts, Socket.IO is attached to it, listening for WebSocket upgrade requests.
2. On the client side, `SocketContext.jsx` creates a persistent connection using `io(SOCKET_URL, { auth: { token } })`.
3. The server's connection middleware verifies the JWT token from `socket.handshake.auth.token` using the same `jwt.verify()` as the REST API.
4. On successful auth, the user is placed in a personal room `user:{userId}` and their presence is tracked.

**Room Architecture:**

| Room Type | Room ID | Used For |
| :--- | :--- | :--- |
| Personal | `user:{userId}` | Notifications, status updates |
| Conversation | `conversation:{id}` | 1-on-1 messaging |
| Community | `community:{id}` | Group chat messages |
| Code Room | `code_room:{roomId}` | Live code synchronization, execution status, and interview chat |

**Code Room State Management (`this.codeRooms`):**
The gateway manages active coding rooms in an in-memory map storing:
- `users`: Map of socket connections with roles (`Host` vs `Candidate`) and avatars
- `code`: Current code buffer (sent to newly connected peers on `code_init_state`)
- `language`: Active syntax mode (`javascript`, `typescript`, `python`)
- `problemId`: Active LeetCode challenge identifier

**Events:**

| Event | Direction | Purpose |
| :--- | :--- | :--- |
| `new_message` | Server → Client | Delivers a new chat message to conversation participants |
| `new_notification` | Server → Client | Pushes notifications (likes, comments, connection requests) |
| `user_status` | Server → Client | Broadcasts ONLINE/OFFLINE presence changes |
| `typing_start` / `typing_stop` | Client ⇄ Server | Shows / hides typing indicator in conversations |
| `join_code_room` | Client → Server | Joins an interview room with user profile metadata |
| `code_room_users` | Server → Client | Broadcasts updated participant list and online counts |
| `code_init_state` | Server → Client | Delivers existing code buffer to newly joined candidate |
| `code_change` | Client → Server | Dispatches debounced code edits |
| `code_updated` | Server → Client | Relays code changes to all peers in the room |
| `code_run` / `code_executing` | Client ⇄ Server | Broadcasts live test execution activity indicator |
| `code_chat_message` / `received` | Client ⇄ Server | Real-time in-room interview text chat |
| `leave_code_room` | Client → Server | Leaves the coding room and updates presence |

---

## 10. Media & File Uploads

**Cloudinary** is used for all media storage, transformation, and CDN delivery.

**How the upload flow works:**

1. The user creates a post with an image or updates their avatar.
2. The frontend sends the file as `multipart/form-data` (Content-Type header is set automatically by Axios).
3. On the backend, **Multer** middleware (`src/config/multer.js`) intercepts the file from the HTTP request and stores it temporarily.
4. The file is then uploaded to **Cloudinary's CDN** using the Cloudinary SDK (`src/config/cloudinary.js`), authenticated with `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET`.
5. Cloudinary processes the image (generates responsive sizes, optimizes quality) and returns a secure URL like `https://res.cloudinary.com/your-cloud/image/upload/v123/posts/abc.jpg`.
6. The secure URL is stored in the MongoDB document (post or user profile).
7. The frontend renders images directly from Cloudinary's global CDN, ensuring fast load times worldwide.

---

## 11. DevOps & Infrastructure

### 11.1 Docker Containerization

#### Backend Dockerfile (`backend/Dockerfile`)

```text
Strategy:     Single-stage Alpine build
Base Image:   node:20-alpine (minimal Linux, ~50MB)
Init System:  dumb-init (proper PID 1 signal handling for graceful shutdown)
User:         node (non-root for security — if the container is compromised,
              the attacker has limited permissions)
Port:         3030
Entrypoint:   dumb-init node server.js
Image Size:   ~787MB (includes node_modules)
```

**Why `dumb-init`?** Docker containers run the main process as PID 1. Without an init system, signals like `SIGTERM` (sent during `docker stop`) are not forwarded to the Node.js process, causing it to be hard-killed after a timeout instead of shutting down gracefully. `dumb-init` acts as a proper init system that forwards signals correctly.

#### Frontend Dockerfile (`frontend/Dockerfile`)

```text
Strategy:     3-stage multi-stage build
Stage 1:      Install npm dependencies only (cached layer)
Stage 2:      Build Next.js production bundle with standalone output
Stage 3:      Copy only the standalone bundle to a clean Alpine image
User:         nextjs:nodejs (non-root)
Port:         3000
Image Size:   ~150-322MB (vs ~1.2GB without standalone optimization)
```

**Why standalone output?** Next.js `output: "standalone"` in `next.config.mjs` produces a self-contained `server.js` that only includes the modules actually imported by the application. This eliminates hundreds of unused packages from `node_modules`, reducing the Docker image size by up to 75%.

---

### 11.2 Docker Compose Orchestration

File: `docker-compose.yml`

**Three services:**

```text
1. proconnect_redis    → redis:7-alpine → Port 6379
2. proconnect_backend  → ./backend      → Port 3030
3. proconnect_frontend → ./frontend     → Port 3000
```

**Startup order enforced via health checks:**

```mermaid
graph TD
    Redis["proconnect_redis"] -->|"healthcheck: redis-cli ping returns PONG"| Backend["proconnect_backend"]
    Backend -->|"healthcheck: wget /health returns 200"| Frontend["proconnect_frontend"]
    Backend --> MongoAtlas[("MongoDB Atlas Cloud")]
    Backend --> Upstash[("Upstash Redis Cloud")]
    Backend --> Gmail["Gmail SMTP"]
```

1. **Redis** starts first. Docker waits until `redis-cli ping` returns `PONG` (usually takes ~1 second).
2. **Backend** starts after Redis is healthy (`depends_on: redis: condition: service_healthy`). Docker waits until `wget --spider http://localhost:3030/health` returns HTTP 200.
3. **Frontend** starts after Backend is healthy. This ensures the API is available before the frontend tries to server-render pages.

**Key Docker Compose commands:**
```bash
docker compose up --build      # Build images and start all 3 services
docker compose up -d           # Start in background (detached mode)
docker compose ps              # Check running container status and health
docker compose logs backend    # View backend container logs
docker compose logs -f         # Follow all container logs in real-time
docker compose down            # Stop and remove all containers and networks
docker compose down -v         # Also remove persistent volumes
```

---

### 11.3 GitHub Actions CI/CD Pipeline

File: `.github/workflows/ci.yml`

**Triggers automatically on:** Every `git push` or Pull Request to `main`, `master`, or `develop` branches.

**Pipeline architecture (3 parallel + 1 sequential job):**

```mermaid
graph TD
    Push["Git Push or Pull Request"] --> Parallel{"Parallel Execution"}
    
    Parallel --> Job1["Job 1: Backend CI and Security"]
    Parallel --> Job2["Job 2: Frontend CI and Build"]
    
    Job1 --> Gate{"Both Jobs Pass?"}
    Job2 --> Gate
    
    Gate --> Job3["Job 3: Docker Validation"]
    
    Job3 --> Green["All Checks Passed"]
```

**Job 1: Backend CI & Security**
- Sets up Node.js 20 on Ubuntu
- Caches `node_modules` using `actions/cache@v4` (avoids re-downloading on every push)
- Runs `npm ci` (clean install from lockfile)
- Runs `npm audit --audit-level=critical` (flags known CVEs in dependencies)
- Verifies the app can import correctly (catches broken imports and syntax errors)

**Job 2: Frontend CI & Production Build**
- Sets up Node.js 20 on Ubuntu
- Caches both `node_modules` and `.next/cache` (Next.js compiler output)
- Runs `npm ci`
- Runs `npx next lint` (ESLint validation for React/Next.js best practices)
- Runs `npm run build` (full production standalone build — catches type errors, missing imports, SSR issues)

**Job 3: Docker Validation** (runs only after Jobs 1 & 2 pass)
- Validates `docker-compose.yml` syntax with `docker compose config`
- Builds backend Docker image using `docker/build-push-action@v5` with BuildKit and GitHub Actions layer caching (`type=gha`)
- Builds frontend Docker image with the same caching strategy
- Does NOT push images to a registry (this is validation only; pushing would be added for deployment)

**Optimizations:**
- `concurrency.cancel-in-progress: true` — If you push 3 commits in rapid succession, only the latest push runs the pipeline; the older runs are cancelled.
- Docker layer caching via `type=gha` — After the first build, subsequent builds reuse cached layers, making Docker validation take seconds instead of minutes.

---

## 12. Complete Request Lifecycle

Here is the complete journey of a single API request, showing every system it touches from the user's click to the database and back:

**Example: User clicks "Like" on a post**

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Next as Next.js Frontend
    participant Axios as apiClient.js
    participant Express as Express.js Server
    participant Security as Security Headers
    participant CORS as CORS Whitelist
    participant Sanitize as Input Sanitizer
    participant RateLimit as Rate Limiter with Redis
    participant Auth as JWT Auth Middleware
    participant Controller as Post Controller
    participant Service as Post Service
    participant Repo as Post Repository
    participant Mongo as MongoDB Atlas
    participant Socket as Socket.IO Gateway

    User->>Next: Click Like button on a post
    Next->>Axios: api.likePost postId
    Axios->>Axios: Inject Bearer token from localStorage
    Axios->>Express: POST /api/v1/posts/postId/like

    Express->>Security: Set X-Frame-Options HSTS CSP
    Security->>CORS: Verify origin is whitelisted
    CORS->>Sanitize: Strip dollar signs and script tags from body
    Sanitize->>RateLimit: Check IP against Redis sliding window

    alt Under 300 requests in 15 min
        RateLimit->>Auth: Verify JWT signature and expiry
        Auth->>Controller: req.user contains id and role
        Controller->>Service: likePost postId userId
        Service->>Repo: Post.findByIdAndUpdate addToSet likes userId
        Repo->>Mongo: Atomic update
        Mongo-->>Repo: Updated post document
        Repo-->>Service: Post with updated likes array
        Service->>Socket: Emit new_notification to post author
        Service-->>Controller: liked true totalLikes 42
        Controller-->>Express: res.json success true
        Express-->>Axios: 200 OK
        Axios-->>Next: Update Redux state
        Next-->>User: Like button animates with heart
    else Over 300 requests
        RateLimit-->>Express: 429 Too Many Requests
        Express-->>Axios: retryAfterSeconds 900
        Axios-->>Next: Show rate limit error
    end
```

**The same pattern applies to every API interaction:**
1. Frontend calls an `api.*` method from `apiClient.js`
2. Axios interceptor injects the JWT token
3. Express receives the request and runs it through the middleware chain
4. Security headers → CORS check → Input sanitization → Rate limiting → JWT auth
5. Request reaches the module's Controller
6. Controller calls the Service for business logic
7. Service calls the Repository for database operations
8. Repository queries MongoDB via Mongoose
9. Response flows back through the same chain
10. If real-time notification needed, Service also emits a Socket.IO event

---

## 13. Environment Variables Reference

### Backend (`backend/.env`) — Git Ignored

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | No | Server port (default: `3030`) |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string (`mongodb+srv://...`) |
| `JWT_SECRET` | **Yes (prod)** | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | **Yes (prod)** | Secret key for signing refresh tokens |
| `CLOUD_NAME` | No | Cloudinary cloud name for media storage |
| `CLOUD_API_KEY` | No | Cloudinary API key |
| `CLOUD_API_SECRET` | No | Cloudinary API secret |
| `REDIS_URL` | No | Full Redis URL (`rediss://default:pass@host:port` for Upstash TLS) |
| `REDIS_HOST` | No | Redis host (default: `127.0.0.1`) |
| `REDIS_PORT` | No | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | No | Redis password (if using password-protected Redis) |
| `REDIS_ENABLED` | No | Set `false` to disable Redis entirely (defaults to `true`) |
| `SMTP_HOST` | No | SMTP server host (default: `smtp.gmail.com`) |
| `SMTP_PORT` | No | SMTP port (default: `587` for TLS) |
| `SMTP_USER` | No | SMTP email address (Gmail account) |
| `SMTP_PASS` | No | SMTP app password (Gmail app-specific password) |
| `FRONTEND_URL` | No | Frontend origin for CORS whitelist (default: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`) — Git Ignored

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL (e.g., `http://localhost:3030`) |
| `NEXT_PUBLIC_SOCKET_URL` | **Yes** | WebSocket server URL (e.g., `http://localhost:3030`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth Client ID for social login |

---

## 14. Code Collab 2.0 — Real-Time Collaborative IDE

### 14.1 Overview

Code Collab 2.0 is a **LeetCode-inspired, real-time collaborative coding environment** embedded within ProConnect. It enables multiple users to join a shared coding room, solve algorithmic problems together, and communicate via an integrated chat — all without leaving the platform.

**Key Capabilities:**
- LeetCode-style dual-pane layout (Problem Description | Code Editor + Test Results)
- VS Code Dark+ syntax highlighting via a custom regex tokenizer
- Smart editor features: auto-closing brackets, bracket expansion, step-over typing, tab indentation
- Real-time code synchronization across browser tabs and network peers
- In-browser sandboxed test execution with assertion verification
- Integrated peer chat within coding rooms

---

### 14.2 Architecture & File Structure

```text
frontend/src/pages/code-collab/
├── index.jsx               → Main page component (editor, layout, sync logic)
├── codeCollab.module.css    → CSS Modules (LeetCode dark theme, token colors)
└── codeHighlight.js         → Custom syntax tokenizer (VS Code Dark+ colors)

backend/src/infrastructure/websocket/
└── socketGateway.js         → Server-side room management & event broadcasting
```

---

### 14.3 LeetCode-Style Layout

The UI uses a CSS Grid split-pane design:

```text
┌─────────────────────────────────────────────────────────────┐
│  Header Bar  (Room ID · Language selector · Participants)   │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  LEFT PANEL              │  RIGHT PANEL                     │
│  ─────────               │  ──────────                      │
│  Problem Description     │  ┌────────────────────────────┐  │
│  • Title & Difficulty    │  │  Code Editor               │  │
│  • Problem Statement     │  │  (textarea + syntax layer)  │  │
│  • Examples              │  │                             │  │
│  • Constraints           │  │                             │  │
│                          │  ├────────────────────────────┤  │
│  Problem List (sidebar)  │  │  Test Cases / Results       │  │
│                          │  │  • Input tabs              │  │
│                          │  │  • Expected vs Actual      │  │
│                          │  │  • Pass/Fail badges        │  │
│                          │  └────────────────────────────┘  │
├──────────────────────────┴──────────────────────────────────┤
│  Status Bar  (Ln X, Col Y · Run · Submit · Chat toggle)     │
└─────────────────────────────────────────────────────────────┘
```

---

### 14.4 Custom Syntax Highlighting Engine

File: [`codeHighlight.js`](frontend/src/pages/code-collab/codeHighlight.js)

Instead of importing a heavy library (CodeMirror, Monaco), a custom regex-based tokenizer provides VS Code Dark+ coloring at <1KB bundle cost.

**Tokenization pipeline:**

```text
Raw Code String
  → Escape HTML entities (&, <, >)
  → Match against ordered regex patterns
  → Wrap each token in <span class="tok-{type}">
  → Return highlighted HTML string
```

**Token types and their regex patterns (in priority order):**

| Priority | Token Type | Pattern | VS Code Color |
| :--- | :--- | :--- | :--- |
| 1 | `comment` | `// ...` or `/* ... */` | `#6a9955` (green) |
| 2 | `string` | `"..."`, `'...'`, `` `...` `` | `#ce9178` (orange) |
| 3 | `keyword` | `const`, `function`, `return`, `if`, `class`, etc. | `#569cd6` (blue) |
| 4 | `type` | `Map`, `Set`, `Array`, `Promise`, `int`, etc. | `#4ec9b0` (teal) |
| 5 | `number` | `123`, `3.14` | `#b5cea8` (light green) |
| 6 | `function` | identifier followed by `(` | `#dcdcaa` (yellow) |
| 7 | `bracket-1/2/3` | `{}`, `()`, `[]` | Gold / Orchid / Royal Blue |
| 8 | `operator` | `=>`, `===`, `+`, `-`, `;`, etc. | `#d4d4d4` (grey) |
| 9 | `variable` | Any remaining identifier | `#9cdcfe` (light blue) |

---

### 14.5 Dual-Layer Editor Architecture

The editor uses a **two-layer overlay technique** to achieve syntax highlighting inside what feels like an editable code area:

```text
┌─────────────────────────────────────────────┐
│  Layer 1: <textarea>  (invisible text)      │  ← User types here
│  - Transparent color, transparent caret     │     Handles all keyboard input
│  - position: absolute, z-index: 2           │
├─────────────────────────────────────────────┤
│  Layer 2: <pre> "Syntax Layer"              │  ← User sees this
│  - Contains tokenized HTML from tokenizer   │     Read-only visual display
│  - position: absolute, z-index: 1           │
├─────────────────────────────────────────────┤
│  Layer 3: Line number gutter                │  ← Synced scroll
│  - Numbered lines matching code content     │
└─────────────────────────────────────────────┘
```

**How it works:**
1. User types in the transparent `<textarea>` (Layer 1)
2. On every keystroke, `highlightCodeToHtml(code)` re-tokenizes the code
3. The tokenized HTML is injected into the `<pre>` element (Layer 2) via `dangerouslySetInnerHTML`
4. Both layers share identical font, padding, and scroll position — so the colored tokens align perfectly with the invisible text
5. Line numbers in the gutter scroll in sync via the `onScroll` event handler

---

### 14.6 Smart Editor Features

The `handleKeyDown` function intercepts keyboard events to provide IDE-like behavior:

| Feature | Trigger | Behavior |
| :--- | :--- | :--- |
| **Auto-close brackets** | Typing `(`, `[`, `{`, `"`, `'`, `` ` `` | Inserts matching closing character |
| **Bracket expansion** | Pressing `Enter` between `{}`, `()`, `[]` | Creates indented new line with closing bracket below |
| **Step-over typing** | Typing `)`, `]`, `}`, `"`, `'` when next char matches | Moves cursor past existing character instead of inserting duplicate |
| **Smart backspace** | `Backspace` between matching empty pair `()`, `[]`, `{}` | Deletes both opening and closing characters |
| **Tab indentation** | `Tab` / `Shift+Tab` | Inserts/removes 2-space indent (prevents focus loss) |

---

### 14.7 Real-Time Synchronization

Code Collab uses a **hybrid sync architecture** combining two transport layers:

```mermaid
graph LR
    subgraph "Same Browser"
        Tab1["Tab 1 (Editor)"] -- "BroadcastChannel\n0ms latency" --> Tab2["Tab 2 (Editor)"]
    end
    
    subgraph "Network"
        Tab1 -- "Socket.IO\ncode_change event" --> Server["SocketGateway\n(Backend)"]
        Server -- "code_updated event" --> RemotePeer["Remote User's\nBrowser"]
    end
```

**BroadcastChannel (same-origin tabs):**
- Channel name: `code-collab-{roomId}`
- Message types: `CODE_SYNC` (carries `{ code, language, problemIdx }`)
- Provides instant (<1ms) synchronization between tabs in the same browser
- No server roundtrip needed

**Socket.IO (cross-network peers):**
- Room namespace: `code_room:{roomId}`
- Emits `code_change` on every keystroke; server rebroadcasts as `code_updated` to all other peers
- Server persists the latest code buffer in memory (`this.codeRooms` Map) for late joiners

**Conflict Prevention:**
- `isRemoteEditRef` flag prevents echo loops — when a remote edit arrives, the flag is set before updating state, and the subsequent `handleCodeChange` skips re-broadcasting

---

### 14.8 WebSocket Events (Code Collab)

All events are namespaced under the `code_room:{roomId}` Socket.IO room.

#### Client → Server Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| `join_code_room` | `{ roomId, user: { name, avatar } }` | Join a coding room; first joiner becomes Host |
| `code_change` | `{ roomId, code, language, problemId, cursor }` | Broadcast a code edit to all peers |
| `code_run` | `{ roomId, language }` | Notify peers that code execution started |
| `code_chat_message` | `{ roomId, text, user: { name, avatar } }` | Send a chat message to the room |
| `leave_code_room` | `{ roomId }` | Leave the coding room |

#### Server → Client Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| `code_room_users` | `{ roomId, participants[] }` | Updated participant list (sent on join/leave) |
| `code_init_state` | `{ roomId, code, language, problemId }` | Server's buffered state sent to late joiners |
| `code_updated` | `{ roomId, code, language, problemId, cursor, senderId }` | Rebroadcast of a peer's code edit |
| `code_executing` | `{ roomId, language, senderId }` | Notification that a peer is running tests |
| `code_chat_received` | `{ id, text, senderName, senderAvatar, senderId, timestamp }` | Chat message delivered to all room members |

---

### 14.9 Server-Side Room Management

File: [`socketGateway.js`](backend/src/infrastructure/websocket/socketGateway.js)

The `SocketGateway` class maintains an in-memory `codeRooms` Map:

```text
this.codeRooms = Map<roomId, {
  users:     Map<socketId, { socketId, userId, name, avatar, role, joinedAt }>,
  code:      string | null,     // Latest code buffer
  language:  string | null,     // Current language
  problemId: string | null,     // Active problem ID
}>
```

**Room lifecycle:**
1. **Created** when the first user emits `join_code_room` for a new `roomId`
2. **Persists** the latest code/language/problemId in memory (no database — ephemeral)
3. **Auto-cleaned** when the last participant disconnects or emits `leave_code_room`

**Role assignment:** First joiner = `"Host"`, subsequent joiners = `"Candidate"`.

**Guest access:** The Socket.IO auth middleware allows anonymous connections (no JWT required), enabling guest users to participate in coding sessions without signing up.

---

### 14.10 In-Browser Test Execution

Tests run entirely in the browser sandbox — **no server-side code execution:**

```text
User clicks "Run" or "Submit"
  → Wraps user code + test harness in a Function constructor
  → Executes inside try/catch with a timeout guard
  → Compares actual output against expected values (deep equality)
  → Renders pass/fail badges per test case in the bottom panel
```

**Security:** Code runs in the same JS context (no `eval` of raw strings). The Function constructor provides basic sandboxing. Since this is a collaborative practice tool (not a competitive judge), full VM isolation is not required.

---

### 14.11 Supported Languages

The problem library includes starter code templates for:

| Language | File Extension | Syntax Highlighting |
| :--- | :--- | :--- |
| JavaScript | `.js` | ✅ Full token coverage |
| TypeScript | `.ts` | ✅ Full token coverage |
| Python | `.py` | ✅ Keyword + builtin support |
| C++ | `.cpp` | ✅ Basic keyword support |

> **Note:** In-browser test execution currently supports JavaScript only. TypeScript, Python, and C++ starter code is provided for practice/display but requires a backend execution engine for actual test runs.

---

## 15. Production Observability, Security & Testing Suite

ProConnect 2.0 incorporates enterprise reliability and security engineering practices across all operational layers.

### 15.1 Structured Logging & Distributed Tracing (Winston)

File: [`logger.js`](backend/src/infrastructure/logger/logger.js)

The backend replaces unformatted `console.log` with a production-grade Winston logging engine providing structured JSON telemetry:
- **Environment-Adaptive Output**:
  - In development: colorized, human-readable terminal output with timestamps.
  - In production: pure structured JSON records formatted for ELK, Datadog, AWS CloudWatch, or Grafana Loki.
- **Request Correlation IDs (`X-Correlation-Id`)**:
  - Every incoming HTTP request receives or generates a unique 8-character correlation ID via `crypto.randomUUID().split("-")[0]`.
  - The correlation ID is echoed in the `X-Correlation-Id` response header and injected into all log entries emitted during that request lifecycle, allowing distributed end-to-end request tracing.
- **HTTP Request Logger Middleware (`httpLogger`)**:
  - Tracks HTTP method, sanitized URL, response status code, execution duration in milliseconds (`process.hrtime.bigint`), client IP, and authenticated user ID.
  - Automatically categorizes logs: `status >= 500` as error, `400-499` as warning, `200-399` as info.
- **File Rotation Transports**:
  - `logs/error.log`: dedicated error log with 5MB max file size and 5-file rotation.
  - `logs/combined.log`: all log levels with 10MB max file size and 3-file rotation.

---

### 15.2 OAuth 2.0 Refresh Token Rotation & Reuse Detection

Files: [`refreshToken.model.js`](backend/src/modules/auth/refreshToken.model.js), [`auth.service.js`](backend/src/modules/auth/auth.service.js), [`apiClient.js`](frontend/src/services/apiClient.js)

To defend against persistent token compromise and credential replay attacks, ProConnect implements full **OAuth 2.0 Refresh Token Rotation with Token Family Reuse Detection**:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Axios)
    participant API as Express API (/auth/refresh)
    participant DB as MongoDB (RefreshToken Model)

    Note over Client,DB: Normal Token Rotation
    Client->>API: POST /auth/refresh { refreshToken }
    API->>API: Verify JWT signature & expiration
    API->>DB: Find token by SHA-256 hash
    alt Token Valid & Unused
        API->>DB: Mark current token as isUsed = true
        API->>API: Generate new Access Token + new Refresh Token
        API->>DB: Store new Refresh Token in SAME Family
        API-->>Client: 200 OK { accessToken, refreshToken }
        Client->>Client: Update localStorage with new pair
    else Token Replay / Stolen Token (isUsed === true)
        API->>DB: Invalidate ENTIRE Family (isRevoked = true)
        API->>API: Log Security Alert with Client IP & Family ID
        API-->>Client: 401 Unauthorized (Security Violation)
        Client->>Client: Purge all session storage & redirect to /login
    end
```

1. **Cryptographic Storage**: Raw refresh tokens are never stored in plaintext. Tokens are hashed with SHA-256 before persistence in MongoDB.
2. **Session Family Tree**: Every login initiates a unique `family` UUID. When a refresh token is exchanged, a new child token is generated within the same family.
3. **Replay & Theft Detection**: If an already-invalidated (`isUsed: true`) or revoked token is presented, the system treats it as an attacker replaying a stolen token. The entire family is instantly revoked (`isRevoked: true`), killing all concurrent attacker and legitimate sessions.
4. **TTL Indexing**: Refresh token documents have a TTL index on `expiresAt`, guaranteeing automatic database self-cleanup without background cron leaks.
5. **Frontend Concurrency Lock**: The Axios client (`apiClient.js`) maintains a subscriber queue (`failedQueue`) so that 10 concurrent requests hitting a 401 status trigger only **one** refresh network call, seamlessly queuing and retrying all requests once the new token arrives.

---

### 15.3 Interactive OpenAPI 3.0 Documentation (`/api/docs`)

Files: [`swagger.js`](backend/src/config/swagger.js), [`app.js`](backend/src/app.js)

ProConnect exports fully interactive API documentation adhering to the **OpenAPI 3.0.0 Specification**:
- **Interactive Swagger UI**: Hosted live at `/api/docs` with a custom branded theme, allowing live exploration and testing of endpoints directly from the browser.
- **Raw OpenAPI JSON Spec**: Programmatically exposed at `/api/docs.json` for consumption by Postman, Insomnia, code generation tools, or external API gateways.
- **Documented Subsystems**: Complete specifications for Auth (with BearerAuth and Refresh schemes), Profiles, Posts, Comments, Connections, Messaging, Notifications, Jobs, Communities, Events, Search, and CodeCollab.

---

### 15.4 Notification Pipeline & Email Digest Aggregator

Files: [`notificationDispatcher.js`](backend/src/infrastructure/notifications/notificationDispatcher.js), [`emailService.js`](backend/src/infrastructure/email/emailService.js), [`notification.routes.js`](backend/src/modules/notifications/notification.routes.js)

Upgraded from basic single-channel socket pushes into an enterprise multi-channel notification engine:
- **Channel 1: Real-Time WebSocket Push**: Instant notification toast delivery via `socketGateway.emitToUser`.
- **Channel 2: Instant Email**: Immediate branded HTML alert dispatched for critical events if configured by user.
- **Channel 3: Automated Digest Aggregator**:
  - Aggregates unread notifications into daily or weekly HTML digest summaries.
  - Triggerable on demand via `POST /api/v1/notifications/digest/trigger` or via scheduled worker.
- **User Preference Controls**:
  - `GET /api/v1/notifications/preferences`: Retrieves current user alert settings.
  - `PUT /api/v1/notifications/preferences`: Configures granular opt-ins for connection requests, direct messages, post interactions, job alerts, and email digest frequency (`instant`, `daily`, `weekly`, `off`).

---

### 15.5 Automated Test Suite & CI/CD Integration

Files: [`tests/unit/auth.service.test.js`](backend/tests/unit/auth.service.test.js), [`tests/unit/cacheService.test.js`](backend/tests/unit/cacheService.test.js), [`tests/unit/codeRunner.test.js`](backend/tests/unit/codeRunner.test.js), [`tests/unit/logger.test.js`](backend/tests/unit/logger.test.js), [`tests/integration/api.test.js`](backend/tests/integration/api.test.js), [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

The backend features an automated unit and integration testing suite utilizing Node native test runner (`node:test`, `node:assert`) and `supertest`:

```bash
# Execute entire test suite
cd backend && npm test
```

#### Test Suite Breakdown (31 Passed Tests across 5 Suites, 0 Failures):
1. **API Integration Suite (`api.test.js` - 11 Tests)**:
   - Asserts `GET /` service metadata, health check, and `/api/docs` discovery.
   - Asserts `GET /health` database and redis operational readiness.
   - Asserts `GET /api/docs.json` OpenAPI schema validity.
   - Asserts `POST /api/v1/auth/register` validation guards (400 Bad Request on empty payloads).
   - Asserts `POST /api/v1/auth/login` credential validation guards (400 Bad Request on missing fields).
   - Asserts `POST /api/v1/auth/refresh` validation (400 on missing token, 401 on forged token).
   - Asserts RBAC & Authentication guards on protected endpoints (`GET /auth/me`, `POST /posts`).
   - Asserts `POST /api/v1/codecollab/execute` polyglot code execution and structured evaluation.
2. **Auth Service Unit Suite (`auth.service.test.js` - 5 Tests)**:
   - Validates dual-token JWT signing, expiry claims, and payload properties.
   - Validates deterministic SHA-256 token hashing.
   - Enforces reserved username protections (`admin`, `root`, `support`, etc.).
   - Enforces length and alphanumeric character constraints.
   - Asserts input validation and custom error propagation (`BadRequestError`).
3. **Cache Service Unit Suite (`cacheService.test.js` - 6 Tests)**:
   - Validates cache miss handling and telemetry miss counter incrementing.
   - Validates cache set/get cycles and hit telemetry recording.
   - Validates accurate mathematical hit ratio computation across mixed requests.
   - Asserts direct key deletion and atomic wildcard pattern invalidation (`delPattern`).
   - Validates TTL expiration semantics under in-memory and Redis adapters.
4. **Polyglot Code Runner Suite (`codeRunner.test.js` - 6 Tests)**:
   - Asserts JavaScript Two Sum test harness execution and validation.
   - Asserts failure detection and diagnostic reporting for erroneous code.
   - Asserts Python 3 Two Sum harness execution.
   - Asserts Python 3 Valid Parentheses harness execution.
   - Asserts standard console output (`stdout`) extraction.
   - Asserts execution timeout enforcement on infinite loops (4,000ms sandbox ceiling).
5. **Logger & Tracing Unit Suite (`logger.test.js` - 3 Tests)**:
   - Asserts unique 8-character correlation ID generation.
   - Asserts structured logging of `info`, `warn`, and `error` payloads without unhandled exceptions.
6. **Continuous Integration (CI/CD)**:
   - Wired into GitHub Actions workflow (`ci.yml`) under the `backend-check` job, running on every pull request and push to `main` or `develop`.

---

## 16. Polyglot Sandbox Code Execution Engine

Files:
- Backend: [`backend/src/infrastructure/runner/codeRunnerService.js`](backend/src/infrastructure/runner/codeRunnerService.js), [`backend/src/modules/codecollab/codecollab.controller.js`](backend/src/modules/codecollab/codecollab.controller.js), [`backend/src/modules/codecollab/codecollab.routes.js`](backend/src/modules/codecollab/codecollab.routes.js)
- Frontend: [`frontend/src/pages/code-collab/index.jsx`](frontend/src/pages/code-collab/index.jsx), [`frontend/src/utils/codeHighlight.js`](frontend/src/utils/codeHighlight.js)

```mermaid
graph TD
    subgraph Browser / Collaborative Room
        IDE["LeetCode IDE / Code Editor"] -->|HTTP POST /api/v1/codecollab/execute| Controller["CodeCollabController"]
        IDE -->|WebSocket: code_change, cursor_move| Gateway["SocketGateway (Room Broadcast)"]
    end

    subgraph Backend Execution Engine
        Controller --> Runner["codeRunnerService.js"]
        Runner --> Harness["Inject Canonical Test Harness<br/>(two-sum, valid-parentheses, lru-cache)"]
        Harness --> LangRouter{"Language Router"}
        
        LangRouter -->|JavaScript / TypeScript| VMContext["node:vm Isolated Context<br/>(Memory Cap, 4000ms Timeout)"]
        LangRouter -->|Python 3| Subprocess["child_process / Judge0 CE<br/>(Subprocess Sandbox, JSON Delimited)"]
        LangRouter -->|C++ GCC / Java 24| Judge0["Judge0 CE Remote Compiler<br/>(Base64 Encoded, Sandboxed Pod)"]
        
        VMContext --> OutputParser["Parse Output & __TEST_RESULTS__"]
        Subprocess --> OutputParser
        Judge0 --> OutputParser
    end

    OutputParser --> ReturnEval["Structured Evaluation Payload<br/>(allPassed, duration, memory, stdout, stderr, results)"]
    ReturnEval --> Controller
    Controller --> IDE
    Controller -->|Socket: code_result_received| Peer["Peer Interviewers / Collaborators"]
```

### 16.1 Hybrid Sandboxed Execution Architecture
To provide a zero-cost, high-performance competitive coding and technical interview experience, ProConnect implements a **Hybrid Execution Engine**:
- **JavaScript / TypeScript**: Evaluated within an isolated `node:vm` context. Global objects (`process`, `fs`, `require`, `child_process`) are stripped from the sandbox to prevent remote code execution. Execution time is capped at 4,000ms.
- **Python 3**: Evaluated locally via isolated subprocess execution with stdin/stdout piping and structured JSON delimiter parsing (`__TEST_RESULTS__`), with automatic remote failover to Judge0 CE.
- **C++ (GCC 9.2) & Java 24**: Compiled and executed via the Judge0 CE public engine with isolated CPU, memory, and wall-time quotas.

### 16.2 Canonical LeetCode Test Harnesses
The backend dynamically binds user-submitted code into canonical test harnesses:
- **Two Sum**: Binds solution methods against array input matrices, checking index equality and order-agnostic complements.
- **Valid Parentheses**: Evaluates bracket string validity with edge cases (`()`, `()[]{}`, `(]`).
- **LRU Cache**: Instantiates cache objects, runs sequential `put` and `get` operations, and asserts eviction behavior under constrained capacity.

### 16.3 Real-Time Collaborative Result Synchronization
When an interviewee runs or submits code in an active room:
1. The execution result is evaluated and returned to the runner.
2. The `socketGateway.js` broadcasts a `code_result_received` event to all peers in the room.
3. Collaborators receive the live status badge (PASSED/FAILED), runtime latency, memory usage, and console standard output (`stdout`/`stderr`) in real-time.

### 16.4 Dual-Tier Fallback & Fault Tolerance
If the remote execution server is unreachable or offline, the client editor automatically falls back to an in-browser isolated evaluation engine for JavaScript, displaying informative diagnostic badges for compiled languages without crashing the collaborative session.

---

> **End of Documentation**
>
> ProConnect 2.0 — Built with Node.js 20, Express 5, Next.js 16, React 19, MongoDB Atlas, Redis (Upstash), Socket.IO, Cloudinary, Docker, Winston, Swagger/OpenAPI, and GitHub Actions.

