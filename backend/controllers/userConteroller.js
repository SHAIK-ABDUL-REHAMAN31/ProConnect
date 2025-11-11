import User from "../models/userSchema.js";
import { Profile } from "../models/profileSchema.js";
import ConnectionRequest from "../models/connectionsSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const convertProfileToPDF = async (userProfile) => {
  console.log("convertProfiletopdf ======", userProfile);
  const doc = new PDFDocument();
  const outputFileName = crypto.randomBytes(32).toString("hex") + ".pdf";
  const outputDir = path.join(process.cwd(), "uploads");
  const outputPath = path.join(outputDir, outputFileName);

  // Ensure uploads directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  try {
    let profileImage = userProfile.userId.profilePicture || "default.jpg";
    if (profileImage.startsWith("uploads/")) {
      profileImage = profileImage.replace("uploads/", "");
    }

    const profileImagePath = path.resolve(outputDir, profileImage);
    console.log(" Checking profile image path:", profileImagePath);

    if (fs.existsSync(profileImagePath)) {
      try {
        doc.image(profileImagePath, {
          align: "center",
          width: 200,
          borderRadius: "20px",
        });
        console.log(" Profile image added successfully");
      } catch (imgErr) {
        console.warn(" Failed to render image:", imgErr.message);
        doc.text("Profile picture unavailable.");
      }
    } else {
      console.warn(" Image not found at:", profileImagePath);
      doc.text("Profile picture unavailable.");
    }

    doc.moveDown();
    doc.fontSize(14).text(`Name: ${userProfile.userId.name}`);
    doc.text(`Username: ${userProfile.userId.username}`);
    doc.text(`Email: ${userProfile.userId.email}`);
    doc.text(`Bio: ${userProfile.bio || "N/A"}`);
    doc.text(`Current Post: ${userProfile.currentPost || "N/A"}`);
    doc.moveDown();
    doc.fontSize(16).text("Past Work:", { underline: true });
    doc.moveDown();

    if (
      Array.isArray(userProfile.pastWork) &&
      userProfile.pastWork.length > 0
    ) {
      userProfile.pastWork.forEach((work) => {
        doc.fontSize(14).text(`Company: ${work.company}`);
        doc.text(`Position: ${work.position}`);
        doc.text(`Years: ${work.years}`);
        doc.moveDown();
      });
    } else {
      doc.text("No past work information available.");
    }

    doc.moveDown();
    doc.fontSize(16).text("Education:", { underline: true });
    doc.moveDown();

    if (
      Array.isArray(userProfile.education) &&
      userProfile.education.length > 0
    ) {
      userProfile.education.forEach((edu) => {
        doc.fontSize(14).text(`School: ${edu.school}`);
        doc.text(`Degree: ${edu.degree}`);
        doc.text(`Field of Study: ${edu.fieldOfStudy}`);
        doc.moveDown();
      });
    } else {
      doc.text("No education information available.");
    }
  } catch (err) {
    console.error(" Error generating PDF:", err);
    doc.text("Error while generating image, proceeding without it.");
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log("PDF successfully generated:", outputFileName);
      resolve(outputFileName);
    });
    stream.on("error", (err) => {
      console.error(" PDF stream error:", err);
      reject(err);
    });
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!email || !name || !username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already Exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      email,
    });
    await newUser.save();

    const profile = new Profile({ userId: newUser._id });
    await profile.save();
    return res.json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = crypto.randomBytes(64).toString("hex");
    user.token = token;
    await user.updateOne({ _id: user._id }, { token: token });
    await user.save();
    return res.status(200).json({ token: token, message: "Login successful." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const updateProfilePicture = async (req, res, next) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }
    user.profilePicture = req.file.filename;
    await user.save();
    return res.status(200).json({ message: "Profile picture updated." });
  } catch (error) {
    console.error("Profile picture update error:", error);
    return res
      .status(500)
      .json({ message: "Server error during profile picture update." });
  }
};

export const updateUserprofile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ messge: "Unauthorized user." });
    }

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res
          .status(400)
          .json({ message: "Username or email already in use." });
      }
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Profile update error:", error);
    return res
      .status(500)
      .json({ message: "Server error during profile update." });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );
    return res.status(200).json({ profile: userProfile });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res
      .status(500)
      .json({ message: "Server error during fetching user profile." });
  }
};

export const updateUserData = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const userprofile = await User.findOne({ token: token });
    if (!userprofile) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const update_user_profile = await Profile.findOne({
      userId: userprofile._id,
    });
    if (!update_user_profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    Object.assign(update_user_profile, newUserData);
    await update_user_profile.save();
    return res.status(200).json({ message: "User data updated successfully." });
  } catch (error) {
    console.error("User data update error:", error);
    return res
      .status(500)
      .json({ message: "Server error during user data update." });
  }
};

export const getAllUsersProfiles = async (req, res) => {
  try {
    const usersProfiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.status(200).json({ profiles: usersProfiles });
  } catch (error) {
    console.error("Get all users profiles error:", error);
    return res
      .status(500)
      .json({ message: "Server error during fetching all users profiles." });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;
    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture"
    );

    console.log("user Profile : ", userProfile);

    if (!userProfile) {
      return res.status(404).json({ message: "UserProfile not found" });
    }

    let outputPath = await convertProfileToPDF(userProfile);
    return res.status(200).json({ message: outputPath });
  } catch (error) {
    console.error("Error while Downloading Profile :", error);
    return res
      .status(500)
      .json({ message: "Server error during Downloading Profile." });
  }
};

export const sendConnnectionRequest = async (req, res) => {
  // Implementation for sending connection requests
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "User Not Found." });
    }

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection User Not Found." });
    }

    // Check if a connection request already exists
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionId,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Connection Request Already Sent." });
    }
    const newConnectionRequest = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionId,
    });
    await newConnectionRequest.save();
    return res.status(200).json({ message: "Connection Request Sent." });
  } catch (error) {
    console.error("Connection request error:", error);
    return res
      .status(500)
      .json({ message: "Server error during connection request." });
  }
};

export const getMyConnectionsRequest = async (req, res) => {
  // Implementation for retrieving user connections
  const token = req.query.token;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "  Unauthorized user." });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.status(200).json({ connections: connections });
  } catch (error) {
    console.error("Get connections error:", error);
    return res
      .status(500)
      .json({ message: "Server error during fetching connections." });
  }
};

export const whatAreMyConnections = async (req, res) => {
  // Implementation for retrieving user connections
  const token = req.query.token;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // if (user) {
    //   return res.status(200).json({ message: "userFound", user: user._id });
    // }
    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");
    return res.status(200).json({ connections: connections });
  } catch (error) {
    console.error("Get connections error:", error);
    return res
      .status(500)
      .json({ message: "Server error during fetching connections." });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  // Implementation for accepting connection requests
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
    });
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection Request Not Found." });
    }

    if (action_type !== "accept") {
      connectionRequest.status_accepted = true;
    } else {
      connectionRequest.status_accepted = false;
    }

    await connectionRequest.save();
    return res
      .status(200)
      .json({ message: "Connection Request Responded Successfully." });
  } catch (error) {
    console.error("Accept connection request error:", error);
    return res
      .status(500)
      .json({ message: "Server error during accepting connection request." });
  }
};

export const getuserProfileBasedOnUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "User Not Found." });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );
    return res.status(200).json({ userProfile });
  } catch (err) {
    console.error("Accept connection request error:", err);
    return res.status(500).json({
      message:
        "Server error during getting UserProfileBasedOnUsername request.",
    });
  }
};
