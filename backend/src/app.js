import express from "express";
import cors from "cors";
import path from "path";
import apiV1Router from "./routes/v1/index.js";
import legacyPostRoutes from "../routes/posts.routes.js";
import legacyUserRoutes from "../routes/user.routes.js";
import { errorHandler } from "./core/middleware/error.middleware.js";
import { securityHeaders } from "./core/middleware/security.middleware.js";
import { sanitizeInputs } from "./core/middleware/sanitize.middleware.js";
import { generalApiLimiter } from "./core/middleware/rateLimiter.middleware.js";

const app = express();

// 1. Security HTTP Headers (Helmet Equivalent)
app.use(securityHeaders);

// 2. CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://linkedin-clone-frontend-psi.vercel.app",
      "https://proconnect-hm0q.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// 3. Payload size limiting & body parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 4. NoSQL Injection & XSS Input Sanitizer
app.use(sanitizeInputs);

// Static uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Upgraded API v1 Routes (Protected with General Rate Limiter)
app.use("/api/v1", generalApiLimiter, apiV1Router);

// Legacy 1.0 Routes for full backwards compatibility
app.use(legacyPostRoutes);
app.use(legacyUserRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
