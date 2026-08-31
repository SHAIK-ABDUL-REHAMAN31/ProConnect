import { Router } from "express";
import codeCollabController from "./codecollab.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/sessions", authenticate, codeCollabController.create);
router.get("/sessions/:sessionId", codeCollabController.getSession);
router.put("/sessions/:sessionId", authenticate, codeCollabController.syncCode);
router.post("/sessions/:sessionId/join", authenticate, codeCollabController.joinSession);

export default router;
