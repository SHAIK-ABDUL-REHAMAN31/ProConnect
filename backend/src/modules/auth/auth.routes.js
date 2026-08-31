import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { authRateLimiter } from "../../core/middleware/rateLimiter.middleware.js";
import { uploadAvatar } from "../../config/multer.js";

const router = Router();

router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.get("/me", authenticate, authController.me);
router.post("/avatar", authenticate, uploadAvatar.single("profile_picture"), authController.updateAvatar);

export default router;
