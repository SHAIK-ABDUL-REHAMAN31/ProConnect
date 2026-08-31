import { Router } from "express";
import { communityController } from "./community.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { uploadMedia } from "../../config/multer.js";

const router = Router();

// Communities Core
router.get("/", communityController.getCommunities);
router.get("/:id", communityController.getCommunityById);
router.post("/", authenticate, uploadMedia.single("banner"), communityController.createCommunity);
router.post("/:id/membership", authenticate, communityController.toggleMembership);
router.put("/:id/settings", authenticate, uploadMedia.single("banner"), communityController.updateCommunitySettings);
router.post("/:id/moderators", authenticate, communityController.manageModerator);

// Group Chat & Messages
router.get("/:id/messages", communityController.getMessages);
router.post("/:id/messages", authenticate, uploadMedia.single("media"), communityController.sendMessage);
router.post("/:id/messages/:messageId/vote", authenticate, communityController.voteMessage);
router.delete("/:id/messages/:messageId", authenticate, communityController.deleteMessage);

// Media Upload
router.post("/:id/upload", authenticate, uploadMedia.single("media"), communityController.uploadMedia);

export default router;
