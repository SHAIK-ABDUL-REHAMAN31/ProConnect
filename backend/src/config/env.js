import dotenv from "dotenv";
dotenv.config();

const isProduction = (process.env.NODE_ENV || "development") === "production";

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("[SECURITY CRITICAL] JWT_SECRET must be explicitly defined in production environment variables.");
}

export const ENV = {
  PORT: process.env.PORT || 3030,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/proconnect",
  JWT_SECRET: process.env.JWT_SECRET || (isProduction ? undefined : "proconnect_dev_only_jwt_secret_change_in_production"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || (isProduction ? undefined : "proconnect_dev_only_refresh_secret_change_in_production"),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  CLOUD_NAME: process.env.CLOUD_NAME || "",
  CLOUD_API_KEY: process.env.CLOUD_API_KEY || "",
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || process.env.EMAIL_FROM || "ProConnect <noreply@proconnect.dev>",
  REDIS_URL: process.env.REDIS_URL || "",
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  REDIS_ENABLED: process.env.REDIS_ENABLED !== "false",
};
