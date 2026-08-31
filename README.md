# 🚀 ProConnect 2.0 — AI-Powered Professional Networking & Career Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18.0.0](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![Next.js: 16+](https://img.shields.io/badge/Next.js-16+-black.svg)](https://nextjs.org)
[![Express: 5.x](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com)
[![Socket.IO: 4.x](https://img.shields.io/badge/Socket.IO-4.x-blueviolet.svg)](https://socket.io)
[![MongoDB: Mongoose](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com)

**ProConnect 2.0** is an enterprise-grade professional networking, recruitment, portfolio, real-time communication, and AI career platform. It bridges the gap between **LinkedIn**, **GitHub**, **Job Portals**, and an **AI Career Coach**.

---

## 🌟 Key Upgrades in Version 2.0

### 1. 🏛️ Modern Modular Architecture (Controller-Service-Repository)
- Clean separation of concerns: **Controller** (HTTP handling) ➔ **Service** (Business logic) ➔ **Repository** (Database operations).
- Standardized API versioning under `/api/v1/`.

### 2. 🔐 Advanced Authentication & Session Security
- JWT-based dual-token authentication (Access Tokens + Refresh Tokens).
- Bcrypt password hashing and secure token validation middleware.
- Role-Based Access Control (User, Recruiter, Company Admin, Moderator, Admin).

### 3. 💼 Comprehensive Career & Jobs Platform
- Job listings, search filters (role, location, type, experience).
- End-to-end Job Application lifecycle: `Applied` ➔ `Screening` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer` ➔ `Hired`.
- Recruiter dashboard & applicant management.

### 4. ⚡ Real-Time Communication & Notifications (Socket.IO)
- Real-time 1-on-1 and group messaging.
- Live typing indicators, presence tracking (Online/Offline), and message read receipts.
- Live instant push notifications for connection requests, likes, comments, and job updates.

### 5. 📄 Resume Builder & Public Portfolio Engine
- Multi-section resume builder (Skills, Work Experience, Projects, Education, Certifications).
- Automated PDF generation with PDFKit.
- Public dynamic portfolio showcase at `/portfolio/[username]`.

### 6. 🤖 AI Career Engine & RAG Ready
- AI-ready module architecture for Career Coaching, Resume ATS Scoring, and Job Match Analysis.

---

## 📁 Repository Structure

```text
proconnect/
├── backend/                  # Node.js + Express.js API Server (Modular Architecture)
│   ├── config/               # Database, Cloudinary, Socket.IO & Env configs
│   ├── core/                 # Error classes, security middleware & response utilities
│   ├── modules/              # Domain modules (Auth, Users, Posts, Jobs, Chat, etc.)
│   ├── infrastructure/       # WebSockets, Queues, Storage adapters
│   └── routes/               # API v1 routes & server entrypoints
│
├── frontend/                 # Next.js 16 + React 19 Frontend (Feature-Based)
│   ├── src/
│   │   ├── components/       # Reusable UI components & Navigation
│   │   ├── features/         # Feature modules (Auth, Feed, Jobs, Messaging, Resume, etc.)
│   │   ├── layout/           # Dashboard & Page layout wrappers
│   │   ├── pages/            # App routes & Dynamic pages
│   │   ├── services/         # Centralized Axios API services
│   │   └── config/redux/     # Redux Toolkit global store & slices
│
├── docs/                     # Architecture, Database & API Specifications
├── shared/                   # Shared types, constants & schemas
├── infrastructure/           # Docker Compose, Nginx & Redis configurations
└── scripts/                  # Database seeders and maintenance scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local instance or MongoDB Atlas Connection URI
- **Cloudinary Account**: For cloud media uploads

### 1. Clone the Repository
```bash
git clone https://github.com/SHAIK-ABDUL-REHAMAN31/ProConnect.git
cd ProConnect
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `backend/` and `frontend/`:
```bash
# In backend/.env
PORT=3030
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000

# In frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3030
NEXT_PUBLIC_SOCKET_URL=http://localhost:3030
```

### 3. Install Dependencies & Run
```bash
# Start Backend
cd backend
npm install
npm run dev

# Start Frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:3000` and Backend API at `http://localhost:3030`.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
