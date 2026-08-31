import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/post/:postId", commentController.getComments);
router.post("/", authenticate, commentController.addComment);
router.delete("/:commentId", authenticate, commentController.deleteComment);

export default router;
