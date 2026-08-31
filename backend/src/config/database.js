import mongoose from "mongoose";
import { ENV } from "./env.js";

let cachedConnection = null;

export const connectDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
    cachedConnection = conn;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("[Database] MongoDB Connection Error:", error);
    throw error;
  }
};

