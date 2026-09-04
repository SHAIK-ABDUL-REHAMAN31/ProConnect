import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { authRateLimiter } from "../../core/middleware/rateLimiter.middleware.js";
import { uploadAvatar } from "../../config/multer.js";

const router = Router();

// Authentication endpoints
router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/google", authRateLimiter, authController.googleAuth);

// Email Verification, Username Availability & Real-world DNS checks
router.get("/check-username", authController.checkUsername);
router.post("/verify-dns", authController.checkDns);
router.post("/send-otp", authRateLimiter, authController.sendOtp);
router.post("/verify-otp", authRateLimiter, authController.verifyOtp);

// Authenticated session endpoints
router.get("/me", authenticate, authController.me);
router.post("/avatar", authenticate, uploadAvatar.single("profile_picture"), authController.updateAvatar);

export default router;
