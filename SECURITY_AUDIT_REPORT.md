# Security Vulnerability Assessment & Audit Report

**Target**: ProConnect Platform (Backend API, Next.js Frontend, Real-time WebSockets, Database Architecture)  
**Status**: Critical Security Review Completed  
**Classification**: Defensive Source Code Security Assessment

---

## Executive Summary

| Severity | Count | Primary Impact Areas |
| :--- | :---: | :--- |
| **Critical** | 5 | Universal Account Takeover, Credential & Token Leaks, BOLA/IDOR in Private Chats & Applications, Exposed Secrets |
| **High** | 6 | Password Verification Bypass, Privilege Escalation / Mass Assignment, Flawed CORS, Path Traversal, HTML Injection, ReDoS |
| **Medium** | 4 | Rate Limiting IP Spoofing, Flawed XSS Regex Blacklist, Insecure Auto-Seed Admin Credentials, Missing CSP |
| **Dependencies** | 34+ | 3 Critical, 21 High CVEs in `npm` packages (`handlebars`, `pdf-creator-node`, `axios`, `multer`, `form-data`) |

---

## 1. Critical Severity Vulnerabilities

### 1.1 Complete Authentication Bypass via Unverified Google Auth
- **Vulnerability Type**: Broken Authentication / Missing Token Validation
- **Location**: `backend/src/modules/auth/auth.service.js` (Lines 339–350)
- **Root Cause**:
  The `googleAuth` method allows clients to authenticate either via a cryptographic Google ID token (`credential`) or directly via a client-provided `userInfo` object:
  ```javascript
  } else if (userInfo && userInfo.email) {
    // Direct userInfo payload from client
    googleUser = {
      email: userInfo.email.toLowerCase().trim(),
      ...
    };
  }
  ```
  If `userInfo.email` is supplied, the backend never validates any cryptographic signature, handshake, or token with Google Identity Services. It directly queries MongoDB for that email and issues valid JWT access and refresh tokens.
- **Security Impact**: Any unauthenticated client can log into **any user account** (including platform administrators) by sending `{ "userInfo": { "email": "victim@domain.com" } }` to `/api/v1/auth/google`.
- **Remediation**:
  Remove the `userInfo` fallback completely. Enforce server-side ID token verification using Google's official library (`google-auth-library`):
  ```javascript
  import { OAuth2Client } from "google-auth-library";
  const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

  async function verifyGoogleToken(idToken) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  }
  ```

---

### 1.2 Bcrypt Password Hash & Active Token Exposure on Public Profile Endpoint
- **Vulnerability Type**: Sensitive Data Exposure / Broken Access Control
- **Location**:
  - Controller: `backend/controllers/userConteroller.js` (Lines 574–585)
  - Schema: `backend/models/userSchema.js` (Lines 20–34)
  - Frontend: `frontend/src/pages/view_profile/[username].jsx` (Lines 472–483)
- **Root Cause**:
  1. In `userConteroller.js`, the endpoint `/user/get_userProfile_basedOn_username` executes:
     ```javascript
     const userProfile = await Profile.findOne({ userId: matchedUser._id })
       .populate("userId")
       .exec();
     res.status(200).json({ userProfile });
     ```
  2. Unlike `backend/src/modules/users/user.model.js`, legacy `backend/models/userSchema.js` does not have `select: false` on `password` or `token`.
  3. The Next.js SSR page `[username].jsx` receives this entire payload in `getServerSideProps` and embeds it directly into the page's HTML document (`window.__NEXT_DATA__`).
- **Security Impact**: Any unauthenticated visitor who navigates to any profile URL (`/view_profile/<username>`) receives the target user's **bcrypt password hash** and **active authentication token** in the response JSON and client HTML source.
- **Remediation**:
  1. Add `select: false` to `password` and `token` in `backend/models/userSchema.js`.
  2. Always explicitly project safe fields in `.populate()`:
     ```javascript
     .populate("userId", "name username email profilePicture headline")
     ```

---

### 1.3 Hardcoded Production Secrets in Source Code & Git History
- **Vulnerability Type**: Security Misconfiguration / Exposed Secrets
- **Location**:
  - `backend/src/config/env.js` (Lines 7–23)
  - `backend/.env`
  - Git Commit History (`32767841`, `40cafd35`, `665c2531`)
- **Root Cause**:
  - `backend/src/config/env.js` hardcodes fallback secrets:
    - Live MongoDB Atlas URI with plaintext username and password.
    - Static JWT Secret (`"proconnect_jwt_super_secret_key_2026"`).
    - Static Refresh Secret (`"proconnect_refresh_super_secret_2026"`).
    - Hardcoded Cloudinary API credentials.
  - `backend/.env` contains live Gmail app passwords (`SMTP_PASS=hadaewdzojtqdvvb`) and Cloudinary secrets.
  - Previous git commits contained `.env` before it was added to `.gitignore`.
- **Security Impact**: Anyone with access to the repository or fallback values can authenticate directly into the MongoDB cluster, forge arbitrary administrator JWT tokens, send unauthorized emails via SMTP, and destroy media in Cloudinary.
- **Remediation**:
  1. Rotate database credentials, Cloudinary API secret, and Gmail App Password immediately.
  2. Remove all hardcoded fallbacks from `backend/src/config/env.js` and throw an exception on startup if required environment variables are absent.
  3. Purge historical commits from git history using `git filter-repo` or BFG Repo-Cleaner.

---

### 1.4 Broken Object-Level Authorization (BOLA / IDOR) in Messaging & WebSockets
- **Vulnerability Type**: Insecure Direct Object Reference / Broken Access Control
- **Location**:
  - `backend/src/modules/messaging/messaging.service.js` (Lines 17–37)
  - `backend/src/infrastructure/websocket/socketGateway.js` (Lines 72–75)
- **Root Cause**:
  - `getMessages(conversationId)` returns all messages for any `conversationId` without checking if `req.user.id` is a member of that conversation.
  - `sendMessage(senderId, conversationId, ...)` accepts any `conversationId` without checking if `senderId` belongs to it.
  - In `socketGateway.js`:
    ```javascript
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });
    ```
    Any connected client can join any room and receive live private chat messages.
- **Security Impact**: Any user can read, intercept, and inject messages into any other two users' private conversations.
- **Remediation**:
  Verify room membership before querying messages or joining rooms:
  ```javascript
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation || !conversation.participants.some(p => p.toString() === userId.toString())) {
    throw new ForbiddenError("Not authorized to access this conversation.");
  }
  ```

---

### 1.5 BOLA / IDOR on Job Applications & Candidate PII
- **Vulnerability Type**: Broken Access Control
- **Location**:
  - `backend/src/modules/applications/application.routes.js` (Lines 9–10)
  - `backend/src/modules/applications/application.service.js` (Lines 44–62)
- **Root Cause**:
  - `GET /api/v1/applications/job/:jobId` is protected only by general `authenticate`. It returns all candidate applications for any job without checking if `req.user.id` is the recruiter who created the job or an admin.
  - `PATCH /api/v1/applications/:id/status` allows any authenticated user to update the status of any application.
- **Security Impact**: Any registered user can view private resumes, phone numbers, notes, and emails of all applicants for any job posting, or tamper with hiring decisions.
- **Remediation**:
  Verify recruiter ownership before querying or updating applications:
  ```javascript
  const job = await jobRepository.findById(jobId);
  if (job.recruiterId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
    throw new ForbiddenError("Only the job recruiter can view or modify applications.");
  }
  ```

---

## 2. High Severity Vulnerabilities

### 2.1 Password Update Verification Bypass
- **Location**: `backend/src/modules/settings/settings.service.js` (Lines 50–61)
- **Root Cause**:
  ```javascript
  const user = await User.findById(userId);
  if (user.password) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestError("Current password is incorrect");
  }
  ```
  Because `UserSchema` marks `password` with `select: false`, `User.findById(userId)` returns `user.password === undefined`. The `if (user.password)` check evaluates to `false`, allowing password changes without validating the current password.
- **Remediation**:
  Explicitly include the password field in the query:
  ```javascript
  const user = await User.findById(userId).select("+password");
  ```

---

### 2.2 Mass Assignment & Role Escalation
- **Location**:
  - `backend/src/modules/auth/auth.service.js` (Lines 196–238)
  - `backend/controllers/userConteroller.js` (Lines 292–313)
- **Root Cause**:
  - `authService.register({ name, email, username, password, role = "USER" })` allows `role` in `req.body` to be saved directly into the new user document without restriction.
  - `userConteroller.updateUserprofile` uses `Object.assign(user, newUserData)` without a field whitelist.
- **Security Impact**: Any user can pass `role: "ADMIN"` or `role: "SUPER_ADMIN"` during registration or update to gain access to admin endpoints (`/api/v1/admin/*`).
- **Remediation**:
  Hardcode `role: "USER"` upon registration. Only permit Super Admins to change user roles. Use explicit whitelisting instead of `Object.assign()`.

---

### 2.3 Broken CORS Origin Validation
- **Location**:
  - `backend/src/app.js` (Lines 30–46)
  - `backend/src/infrastructure/websocket/socketGateway.js` (Lines 16–27)
- **Root Cause**:
  ```javascript
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".onrender.com") ||
    origin.includes("localhost")
  ) {
    return callback(null, true);
  }
  ```
  In `socketGateway.js`, line 26: `return callback(null, true);` unconditionally permits all origins.
- **Security Impact**:
  - `origin.includes("localhost")` matches `attacker-localhost.com` or `localhost.evil.com`.
  - `origin.endsWith(".vercel.app")` matches any third party's free Vercel project.
  - Combined with `credentials: true`, this allows cross-origin credentialed requests and token exfiltration.
- **Remediation**:
  Use strict array matching against an exact whitelist defined in environment variables:
  ```javascript
  const whitelist = [ENV.FRONTEND_URL, "https://pro-connect-eta.vercel.app"].filter(Boolean);
  if (whitelist.includes(origin)) return callback(null, true);
  return callback(new Error("CORS policy violation"));
  ```

---

### 2.4 Path Traversal in PDF Generation
- **Location**: `backend/controllers/userConteroller.js` (Lines 46–56)
- **Root Cause**:
  ```javascript
  let profileImage = userProfile.userId.profilePicture || "default.jpg";
  if (profileImage.startsWith("uploads/")) {
    profileImage = profileImage.replace("uploads/", "");
  }
  const profileImagePath = path.resolve(outputDir, profileImage);
  ```
  If `profilePicture` is set to `../../../../etc/passwd` or `../../.env`, `path.resolve` traverses outside the `uploads` directory. `doc.image(profileImagePath)` attempts to read that file from disk into the PDF.
- **Remediation**:
  Enforce strict basename resolution:
  ```javascript
  const safeFilename = path.basename(profileImage);
  const profileImagePath = path.join(outputDir, safeFilename);
  ```

---

### 2.5 HTML / Email Template Injection in Nodemailer OTP
- **Location**: `backend/src/infrastructure/email/emailService.js` (Lines 162–165)
- **Root Cause**:
  The `name` parameter in `/api/v1/auth/send-otp` is interpolated directly into an HTML template without escaping:
  ```html
  <div class="greeting">Hello ${name},</div>
  ```
- **Security Impact**: Attackers can send phishing emails, injected hyperlinks, or forged company notices using the official server SMTP credentials.
- **Remediation**:
  Sanitize and HTML-encode any user-supplied strings before template interpolation using `validator.escape(name)`.

---

### 2.6 Regular Expression Denial of Service (ReDoS) & Unhandled Syntax Crash
- **Location**:
  - `backend/src/modules/search/search.service.js` (Line 11)
  - `backend/src/modules/events/event.service.js` (Lines 23–25)
  - `backend/src/modules/jobs/job.service.js` (Lines 23–25)
  - `backend/src/modules/learning/learning.service.js` (Lines 11–14)
- **Root Cause**:
  Unsanitized user query parameters are passed directly into `new RegExp(keyword.trim(), "i")` or `{ $regex: query.search }`.
- **Security Impact**:
  - Passing malformed regex patterns like `/api/v1/search?q=(*` throws an unhandled `SyntaxError` that can crash the process.
  - Catastrophic backtracking patterns (e.g., `(a+)+$`) tie up the Node.js event loop, causing denial of service.
- **Remediation**:
  Always escape special regex characters:
  ```javascript
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeRegex = new RegExp(escapeRegex(keyword.trim()), "i");
  ```

---

## 3. Medium Severity Vulnerabilities

### 3.1 Rate Limiter IP Spoofing via Raw Header Inspection
- **Location**: `backend/src/core/middleware/rateLimiter.middleware.js` (Lines 29–33)
- **Root Cause**:
  `req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress` is used without `app.set("trust proxy", 1)`.
- **Security Impact**: Clients can rotate spoofed `X-Forwarded-For` headers to bypass rate limits on brute-force sensitive endpoints.
- **Remediation**:
  Configure `app.set("trust proxy", 1)` and inspect `req.ip`.

---

### 3.2 Flawed Blacklist XSS Sanitization
- **Location**: `backend/src/core/middleware/sanitize.middleware.js` (Lines 19–22)
- **Root Cause**:
  The sanitizer only strips `<script>` tags and `javascript:` URIs via regex. It does not filter inline event handlers (`<img src=x onerror=...>`, `<svg onload=...>`).
- **Remediation**:
  Use `dompurify` or `sanitize-html` for HTML sanitization, and `mongo-sanitize` for NoSQL injection prevention.

---

### 3.3 Plaintext Password in Auto-Seeded Admin User
- **Location**: `backend/src/modules/communities/community.service.js` (Lines 59–65)
- **Root Cause**:
  If the database has no users, it seeds an admin account with a plaintext password: `"Password123!"`.
- **Remediation**:
  Remove database seeding from operational services. Move seeding to standalone migration scripts with hashed, cryptographically random passwords.

---

### 3.4 Missing Content-Security-Policy (CSP) & Session Tokens in Query Strings
- **Location**:
  - `backend/src/core/middleware/security.middleware.js`
  - `backend/src/core/middleware/auth.middleware.js` (Line 17)
- **Root Cause**:
  - `securityHeaders` lacks a `Content-Security-Policy`.
  - `authenticate` accepts tokens from `req.query.token`, leaking session tokens into proxy logs, browser histories, and `Referer` headers.
- **Remediation**:
  Enforce strict CSP headers and require tokens exclusively via `Authorization: Bearer <token>` or `HttpOnly` cookies.

---

## 4. Vulnerable Dependencies (`npm audit`)

| Package | Severity | Advisory / CVE | Risk |
| :--- | :---: | :--- | :--- |
| **`handlebars`** (via `pdf-creator-node`) | **Critical** | GHSA-3mfm-83xf-c92r | AST Type Confusion / Remote Code Execution & Prototype Pollution |
| **`form-data`** (via `request`) | **Critical** | GHSA-fjxv-7rqg-78g4, GHSA-hmw2-7cc7-3qxx | CRLF Injection & Unsafe Random Generator |
| **`pdf-creator-node`** | **High** | GHSA-pp78-659f-p5hx | Arbitrary File Read / SSTI via PhantomJS |
| **`cloudinary`** (<2.7.0) | **High** | GHSA-g4mf-96x5-5m2c | Command / Argument Injection via ampersand |
| **`axios`** (<1.14.0) | **High** | GHSA-pf86-5x62-jrwf, GHSA-6chq-wfr3-2hj9 | Prototype Pollution Gadgets & Header Injection |
| **`multer`** (<2.2.0) | **High** | GHSA-xf7r-hgr6-v32p, GHSA-535w-7cp7-47q4 | Denial of Service via multipart field names |

**Remediation**:
1. Remove deprecated `pdf-creator-node` from `backend/package.json` (the project already has `pdfkit`).
2. Upgrade `cloudinary` to `^2.11.0`.
3. Update `axios` and `multer` in both backend and frontend via `npm update`.

---

## Action Plan & Remediation Checklist

- [x] **Step 1**: Remove unverified `userInfo` payload authentication in `auth.service.js`.
- [x] **Step 2**: Add `select: false` to `password` and `token` in `userSchema.js`, and explicitly omit them in `userConteroller.js`.
- [x] **Step 3**: Fix the password check in `settings.service.js` with `.select("+password")`.
- [x] **Step 4**: Add conversation participant ownership checks in `messaging.service.js` and `socketGateway.js`.
- [x] **Step 5**: Add recruiter ownership checks in `application.service.js`.
- [x] **Step 6**: Rotate database, Cloudinary, and SMTP credentials; remove fallback secrets from `env.js`.
- [x] **Step 7**: Replace wildcard CORS matching with a strict origin whitelist.
- [x] **Step 8**: Remove `pdf-creator-node` and run `npm audit fix`.

