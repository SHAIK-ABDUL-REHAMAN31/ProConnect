import { Router } from "express";
import { postController } from "./post.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { uploadMedia } from "../../config/multer.js";

const router = Router();

router.get("/", postController.getAllPosts);
router.get("/topic/:tag", postController.getByTopic);
router.post("/", authenticate, uploadMedia.single("media"), postController.createPost);
router.delete("/:id", authenticate, postController.deletePost);
router.post("/:id/like", authenticate, postController.likePost);
router.post("/:id/dislike", authenticate, postController.dislikePost);

export default router;

