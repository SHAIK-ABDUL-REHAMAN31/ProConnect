import { Router } from "express";
import { jobController } from "./job.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.post("/", authenticate, jobController.createJob);

export default router;
