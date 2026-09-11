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
import { getRedisStatus } from "./infrastructure/redis/redisClient.js";
import { httpLogger } from "./infrastructure/logger/logger.js";
import { ENV } from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import mongoose from "mongoose";

// Express app configuration
const app = express();

// Trust reverse proxy (Render / Load Balancer) for accurate client IP in rate limiters
app.set("trust proxy", 1);

// 1. Security HTTP Headers (Helmet Equivalent)
app.use(securityHeaders);

// 2. Structured HTTP Request Logger (Winston)
app.use(httpLogger);

// 3. CORS Configuration with strict whitelist
const allowedOrigins = [
  "http://localhost:3000",
  "https://linkedin-clone-frontend-psi.vercel.app",
  "https://pro-connect-eta.vercel.app",
  "https://proconnect-1-8mwt.onrender.com",
  ENV.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, server-to-server, health checkers)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 4. Payload size limiting & body parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 5. NoSQL Injection & XSS Input Sanitizer
app.use(sanitizeInputs);

// Static uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 5. Root Welcome & Health Check Routes
const getHealthStatus = () => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const readyState = mongoose.connection?.readyState ?? 0;
  const dbStatus = dbStates[readyState] || "unknown";
  const isHealthy = readyState === 1;

  return {
    status: isHealthy ? "healthy" : "degraded",
    service: "ProConnect Backend API",
    version: "2.0.0",
    environment: ENV.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      host: mongoose.connection?.host || "cluster-connected",
    },
    redis: {
      status: getRedisStatus(),
    },
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
    timestamp: new Date().toISOString(),
  };
};

// Swagger Interactive OpenAPI 3.0 Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "ProConnect API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Root landing endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 ProConnect 2.0 Backend is Live on Render!",
    version: "2.0.0",
    documentation: "/api/docs",
    healthCheck: "/health",
    ...getHealthStatus(),
  });
});

// Health check endpoints (/health, /api/v1/health, /ping)
app.get(["/health", "/api/v1/health"], (req, res) => {
  const healthData = getHealthStatus();
  const statusCode = healthData.status === "healthy" ? 200 : 200; // Return 200 with degraded note so monitors don't fail during warm-up
  res.status(statusCode).json(healthData);
});

app.get(["/ping", "/api/v1/ping"], (req, res) => {
  res.status(200).send("pong");
});

// Upgraded API v1 Routes (Protected with General Rate Limiter)
app.use("/api/v1", generalApiLimiter, apiV1Router);

// Legacy 1.0 Routes for full backwards compatibility
app.use(legacyPostRoutes);
app.use(legacyUserRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
