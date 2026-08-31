import { Router } from "express";
import settingsController from "./settings.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, settingsController.getSettings);
router.post("/change-password", authenticate, settingsController.updatePassword);
router.get("/export-data", authenticate, settingsController.exportData);

export default router;
