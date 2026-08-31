import { Router } from "express";
import learningController from "./learning.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/", learningController.getAll);
router.get("/my-courses", authenticate, learningController.getMyEnrollments);
router.get("/:slug", learningController.getBySlug);
router.post("/enroll", authenticate, learningController.enroll);
router.post("/complete-module", authenticate, learningController.completeModule);

export default router;
