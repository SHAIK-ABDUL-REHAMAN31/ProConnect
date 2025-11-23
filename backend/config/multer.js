import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts_media",
    allowedFormats: ["jpg", "jpeg", "png", "webp", "mp4"],
  },
});

const upload = multer({ storage });
export default upload;
