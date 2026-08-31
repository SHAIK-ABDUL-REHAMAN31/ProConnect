import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

cloudinary.config({
  cloud_name: ENV.CLOUD_NAME,
  api_key: ENV.CLOUD_API_KEY,
  api_secret: ENV.CLOUD_API_SECRET,
});

export default cloudinary;
