import { Router } from "express";
import { applicationController } from "./application.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, applicationController.apply);
router.get("/my", authenticate, applicationController.getMyApplications);
router.get("/job/:jobId", authenticate, applicationController.getJobApplications);
router.patch("/:id/status", authenticate, applicationController.updateStatus);

export default router;
