import { Router } from "express";
import recommendationController from "./recommendation.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/user/:userId", authenticate, recommendationController.getForUser);
router.post("/give", authenticate, recommendationController.give);
router.patch("/:id/status", authenticate, recommendationController.updateStatus);
router.post("/endorse", authenticate, recommendationController.toggleEndorsement);

export default router;
