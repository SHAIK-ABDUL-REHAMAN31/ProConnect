import { Router } from "express";
import { ActiveCheck } from "../controllers/postsRoutesController.js";
import { createPost } from "../controllers/postsRoutesController.js";
import { getAllPosts } from "../controllers/postsRoutesController.js";
import { deletePost } from "../controllers/postsRoutesController.js";
import { commentOnpost } from "../controllers/postsRoutesController.js";
import { getCommentsOnPost } from "../controllers/postsRoutesController.js";
import { deleteUserComment } from "../controllers/postsRoutesController.js";
import { likePost } from "../controllers/postsRoutesController.js";
import { upload } from "../config/multer.js";

const router = Router();

router.route("/").get(ActiveCheck);
router.post("/create_post", upload.single("media"), createPost);
router.route("/get_all_posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment_on_post").post(commentOnpost);
router.route("/comments_on_post").get(getCommentsOnPost);
router.route("/delete_user_comment").delete(deleteUserComment);
router.route("/like_post").post(likePost);

export default router;
