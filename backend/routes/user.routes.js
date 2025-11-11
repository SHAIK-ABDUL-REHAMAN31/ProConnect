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
router
  .route("/update_profile_picture")
  .post(upload.single("profile_picture"), updateProfilePicture, (req, res) => {
    try {
      return res.status(200).json({ filename: req.file.filename });
    } catch (error) {
      console.error("File upload error:", error);
      return res
        .status(500)
        .json({ message: "Server error during file upload." });
    }
  });

router.route("/register").post(register);
router.route("/login").post(login);
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
