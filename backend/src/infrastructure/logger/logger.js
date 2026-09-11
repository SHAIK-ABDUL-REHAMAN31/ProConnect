import winston from "winston";
import { ENV } from "../../config/env.js";
import crypto from "crypto";

// ───────────────────────────────────────────────────────────
// Winston Logger — Structured JSON Logging with Correlation IDs
// ───────────────────────────────────────────────────────────

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Human-readable format for development
const devFormat = printf(({ level, message, timestamp, correlationId, ...meta }) => {
  const cid = correlationId ? ` [${correlationId}]` : "";
  const extra = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} ${level}${cid}: ${message}${extra}`;
});

// Production JSON format for log aggregators (ELK, CloudWatch, Datadog)
const prodFormat = combine(
  timestamp({ format: "ISO" }),
  errors({ stack: true }),
  json()
);

// Development colorized format
const devCombined = combine(
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  colorize(),
  devFormat
);

const logger = winston.createLogger({
  level: ENV.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "proconnect-api" },
  format: ENV.NODE_ENV === "production" ? prodFormat : devCombined,
  transports: [
    new winston.transports.Console(),
    // Error-only file transport (always active)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB rotation
      maxFiles: 5,
      format: prodFormat,
    }),
    // Combined log file (all levels)
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024, // 10MB rotation
      maxFiles: 3,
      format: prodFormat,
    }),
  ],
  // Don't crash on logging errors
  exitOnError: false,
});

// ───────────────────────────────────────────────────────────
// Correlation ID Generator
// ───────────────────────────────────────────────────────────
export function generateCorrelationId() {
  return crypto.randomUUID().split("-")[0]; // Short 8-char ID (e.g., "a1b2c3d4")
}

// ───────────────────────────────────────────────────────────
// HTTP Request Logger Middleware
// ───────────────────────────────────────────────────────────
export function httpLogger(req, res, next) {
  const correlationId = req.headers["x-correlation-id"] || generateCorrelationId();
  req.correlationId = correlationId;
  res.setHeader("X-Correlation-Id", correlationId);

  const startTime = process.hrtime.bigint();

  // Log on response finish
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    const logData = {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userAgent: req.get("user-agent")?.substring(0, 100),
      userId: req.user?.id || null,
    };

    if (res.statusCode >= 500) {
      logger.error("Request failed", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Client error", logData);
    } else {
      logger.info("Request completed", logData);
    }
  });

  next();
}

export default logger;
