import { Router } from "express";
import { ActiveCheck } from "../controllers/postsRoutesController.js";
import { createPost } from "../controllers/postsRoutesController.js";
import { getAllPosts } from "../controllers/postsRoutesController.js";
import { deletePost } from "../controllers/postsRoutesController.js";
import { commentOnpost } from "../controllers/postsRoutesController.js";
import { getCommentsOnPost } from "../controllers/postsRoutesController.js";
import { deleteUserComment } from "../controllers/postsRoutesController.js";
import { likePost } from "../controllers/postsRoutesController.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/").get(ActiveCheck);
router.route("/create_post").post(upload.single("media"), createPost);
router.route("/get_all_posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment_on_post").post(commentOnpost);
router.route("/comments_on_post").get(getCommentsOnPost);
router.route("/delete_user_comment").delete(deleteUserComment);
router.route("/like_post").post(likePost);

export default router;
