import { Router } from "express";
import { connectionController } from "./connection.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/request", authenticate, connectionController.sendRequest);
router.get("/my", authenticate, connectionController.getMyConnections);
router.post("/respond", authenticate, connectionController.respondToRequest);

export default router;
