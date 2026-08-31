import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, notificationController.getNotifications);
router.patch("/:id/read", authenticate, notificationController.markAsRead);
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

export default router;
