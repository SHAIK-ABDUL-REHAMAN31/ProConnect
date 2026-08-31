import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, profileController.getMyProfile);
router.put("/me", authenticate, profileController.updateProfile);
router.get("/all", profileController.getAllProfiles);
router.get("/:username", profileController.getProfileByUsername);

export default router;
