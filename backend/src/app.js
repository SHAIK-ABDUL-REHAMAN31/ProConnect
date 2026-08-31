import express from "express";
import cors from "cors";
import path from "path";
import apiV1Router from "./routes/v1/index.js";
import legacyPostRoutes from "../routes/posts.routes.js";
import legacyUserRoutes from "../routes/user.routes.js";
import { errorHandler } from "./core/middleware/error.middleware.js";
import { securityHeaders } from "./core/middleware/security.middleware.js";
import { sanitizeInputs } from "./core/middleware/sanitize.middleware.js";
import { connectDatabase } from "./config/database.js";

const app = express();

// Ensure Database Connection for Serverless Functions
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("[Serverless] Database connection error:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// 1. Security HTTP Headers (Helmet Equivalent)
app.use(securityHeaders);

// 2. CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://linkedin-clone-frontend-psi.vercel.app",
  "https://pro-connect-eta.vercel.app",
  ENV.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
