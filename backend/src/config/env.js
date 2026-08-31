import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3030,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb+srv://mrabbu985_db_user:A7W57zD5FHaYdf94@linkedin-clone.qt5fpjt.mongodb.net/?appName=LinkedIn-clone",
  JWT_SECRET: process.env.JWT_SECRET || "proconnect_jwt_super_secret_key_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "proconnect_refresh_super_secret_2026",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  CLOUD_NAME: process.env.CLOUD_NAME || "degf6z7gq",
  CLOUD_API_KEY: process.env.CLOUD_API_KEY || "895529124445831",
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || "vQh5F9gBkJzEa13L4y550e18_3c",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
