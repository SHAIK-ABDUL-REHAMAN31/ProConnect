import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "proconnect_v2/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "mp4"],
    resource_type: "auto",
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "proconnect_v2/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  },
});

export const uploadMedia = multer({
  storage: postStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});
