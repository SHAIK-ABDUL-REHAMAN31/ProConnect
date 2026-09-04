import { Router } from "express";
import {
  getuserProfileBasedOnUsername,
  login,
} from "../controllers/userConteroller.js";
import { register } from "../controllers/userConteroller.js";
import { updateProfilePicture } from "../controllers/userConteroller.js";
import { updateUserprofile } from "../controllers/userConteroller.js";
import { getUserAndProfile } from "../controllers/userConteroller.js";
import { updateUserData } from "../controllers/userConteroller.js";
import { getAllUsersProfiles } from "../controllers/userConteroller.js";
import { downloadProfile } from "../controllers/userConteroller.js";

//coonnection imports
import { sendConnnectionRequest } from "../controllers/userConteroller.js";
import { getMyConnectionsRequest } from "../controllers/userConteroller.js";
import { whatAreMyConnections } from "../controllers/userConteroller.js";
import { acceptConnectionRequest } from "../controllers/userConteroller.js";
import { profileUpload } from "../config/multer.js";
import { authRateLimiter } from "../src/core/middleware/rateLimiter.middleware.js";
import { authController } from "../src/modules/auth/auth.controller.js";
const router = Router();

router
  .route("/profile_picture_update")
  .post(profileUpload.single("profile_picture"), updateProfilePicture);

router.route("/register").post(authRateLimiter, register);
router.route("/login").post(authRateLimiter, login);
router.post("/auth/google", authRateLimiter, (req, res, next) => authController.googleAuth(req, res, next));
router.post("/google_auth", authRateLimiter, (req, res, next) => authController.googleAuth(req, res, next));
router.get("/check_username", (req, res, next) => authController.checkUsername(req, res, next));
router.get("/auth/check-username", (req, res, next) => authController.checkUsername(req, res, next));
router.post("/verify_dns", (req, res, next) => authController.checkDns(req, res, next));
router.post("/send_otp", authRateLimiter, (req, res, next) => authController.sendOtp(req, res, next));
router.post("/verify_otp", authRateLimiter, (req, res, next) => authController.verifyOtp(req, res, next));
router.route("/update_user_profile").post(updateUserprofile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_user_data").post(updateUserData);
router.route("/users/get_all_users").get(getAllUsersProfiles);
router.route("/user/download_profile").get(downloadProfile);
//connection routes
router.route("/user/send_connection_request").post(sendConnnectionRequest);
router.route("/user/get_my_connections_request").get(getMyConnectionsRequest);
router.route("/user/what_are_my_connections").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router
  .route("/user/get_userProfile_basedOn_username")
  .get(getuserProfileBasedOnUsername);

export default router;
