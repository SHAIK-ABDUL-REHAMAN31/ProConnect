import { Router } from "express";
import eventController from "./event.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/", eventController.getAll);
router.get("/:id", eventController.getById);
router.post("/", authenticate, eventController.create);
router.post("/:id/rsvp", authenticate, eventController.toggleRsvp);

export default router;
