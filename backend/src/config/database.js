import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("[Database] MongoDB Connection Error:", error);
    process.exit(1);
  }
};
