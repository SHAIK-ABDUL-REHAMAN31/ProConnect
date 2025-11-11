import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static("uploads"));

const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mrabbu985_db_user:A7W57zD5FHaYdf94@linkedin-clone.qt5fpjt.mongodb.net/?appName=LinkedIn-clone"
    );
    app.listen(3030, () => {
      console.log(`app is listening on port 3030`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

start();
