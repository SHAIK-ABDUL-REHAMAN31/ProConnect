import { Router } from "express";
import { messagingController } from "./messaging.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/conversations", authenticate, messagingController.getConversations);
router.post("/conversations", authenticate, messagingController.startConversation);
router.get("/conversations/:conversationId/messages", authenticate, messagingController.getMessages);
router.post("/messages", authenticate, messagingController.sendMessage);

export default router;
