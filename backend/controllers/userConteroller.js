import User from "../models/userSchema.js";
import { Profile } from "../models/profileSchema.js";
import ConnectionRequest from "../models/connectionsSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import { ENV } from "../src/config/env.js";

export const findUserByToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token,
      ENV.JWT_SECRET || "proconnect_jwt_super_secret_key_2026"
    );
    if (decoded && decoded.id) {
      const user = await User.findById(decoded.id);
      if (user) return user;
    }
  } catch (err) {
    // Fallback to legacy token lookup
  }
  return await User.findOne({ token: token });
};

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
    let { name, email, username, password } = req.body;

    if (!email || !name || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    username = username.trim();

    const validUsername = /^[a-zA-Z0-9_]+$/;
    if (!validUsername.test(username)) {
      return res.status(400).json({
        message:
          "Invalid username. Only letters, numbers, and underscores (_) are allowed. No spaces.",
      });
    }

    const emailLower = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      username,
      password: hashedPassword,
      email: emailLower,
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
    let { email, username, password } = req.body;
    const identifier = (email || username || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email or username and password required." });
    }

    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: { $regex: new RegExp(`^${escapedIdentifier}$`, "i") } },
      ],
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email/username or password." });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Invalid email/username or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = crypto.randomBytes(64).toString("hex");
    user.token = token;
    await user.save();

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      username: user.username,
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const updateProfilePicture = async (req, res, next) => {
  const { token } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (
      user.profilePicture &&
      user.profilePicture.includes("res.cloudinary.com")
    ) {
      try {
        const urlParts = user.profilePicture.split("/");
        const uploadIndex = urlParts.indexOf("upload");
        const publicIdParts = urlParts.slice(uploadIndex + 2);
        const publicId = publicIdParts.join("/").split(".")[0];

        console.log(" Deleting old image with public_id:", publicId);
        const deleteResult = await cloudinary.uploader.destroy(publicId);
        console.log(" Delete result:", deleteResult);
      } catch (deleteError) {
        console.log("Could not delete old image:", deleteError.message);
      }
    }

    const cloudinaryUrl = req.file.path;

    user.profilePicture = cloudinaryUrl;
    await user.save();

    return res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(" Profile picture update error:", error);
    return res.status(500).json({
      message: "Server error during profile picture update.",
      error: error.message,
    });
  }
};

export const updateUserprofile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ messge: "Unauthorized user.." });
    }

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser && String(existingUser._id) !== String(user._id)) {
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
    const token = req.query.token;
    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: " Unauthorized User" });
    }

    let userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture",
    );

    if (!userProfile) {
      userProfile = await Profile.create({ userId: user._id });
      userProfile = await Profile.findOne({ userId: user._id }).populate(
        "userId",
        "name username email profilePicture",
      );
    }

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

    const userprofile = await findUserByToken(token);
    if (!userprofile) {
      return res.status(401).json({ message: "Unauthorized user.." });
    }

    let update_user_profile = await Profile.findOne({
      userId: userprofile._id,
    });
    if (!update_user_profile) {
      update_user_profile = await Profile.create({ userId: userprofile._id });
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
      "name username email profilePicture",
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
      "name username email profilePicture",
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
  try {
    const { token, connectionId } = req.body;
    if (!token || !connectionId) {
      return res.status(400).json({ message: "Token and connectionId are required." });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "User Not Found / Unauthorized." });
    }

    if (user._id.toString() === connectionId.toString()) {
      return res.status(400).json({ message: "Cannot send connection request to yourself." });
    }

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Target connection user not found." });
    }

    // Check bidirectional connection
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: user._id, connectionId: connectionId },
        { userId: connectionId, connectionId: user._id },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status_accepted === true) {
        return res.status(400).json({ message: "You are already connected with this user." });
      }
      return res.status(400).json({ message: "Connection request already pending." });
    }

    const newConnectionRequest = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionId,
      status_accepted: null,
    });
    await newConnectionRequest.save();

    return res.status(200).json({
      message: "Connection Request Sent Successfully.",
      connection: newConnectionRequest,
    });
  } catch (error) {
    console.error("Connection request error:", error);
    return res.status(500).json({ message: "Server error during connection request." });
  }
};

export const getMyConnectionsRequest = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ message: "Token required." });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const connections = await ConnectionRequest.find({
      $or: [{ userId: user._id }, { connectionId: user._id }],
    })
      .populate("userId", "name username email profilePicture")
      .populate("connectionId", "name username email profilePicture")
      .sort({ _id: -1 });

    return res.status(200).json({ connections });
  } catch (error) {
    console.error("Get connections error:", error);
    return res.status(500).json({ message: "Server error during fetching connections." });
  }
};

export const whatAreMyConnections = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({ message: "Token required." });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const connections = await ConnectionRequest.find({
      $or: [{ userId: user._id }, { connectionId: user._id }],
    })
      .populate("userId", "name username email profilePicture")
      .populate("connectionId", "name username email profilePicture")
      .sort({ _id: -1 });

    return res.status(200).json({ connections });
  } catch (error) {
    console.error("Get connections error:", error);
    return res.status(500).json({ message: "Server error while fetching connections." });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { token, requestId, connectionId, action_type } = req.body;
    const reqId = requestId || connectionId;

    if (!token || !reqId) {
      return res.status(400).json({ message: "Token and requestId are required." });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const connectionRequest = await ConnectionRequest.findById(reqId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection Request Not Found." });
    }

    const isAccepted = action_type === "accept" || action_type === true;
    connectionRequest.status_accepted = isAccepted;
    await connectionRequest.save();

    return res.status(200).json({
      message: isAccepted
        ? "Connection request accepted successfully."
        : "Connection request declined.",
      connection: connectionRequest,
    });
  } catch (error) {
    console.error("Accept connection request error:", error);
    return res.status(500).json({ message: "Server error during accepting connection request." });
  }
};


export const getuserProfileBasedOnUsername = async (req, res) => {
  try {
    const incomingRaw = decodeURIComponent(req.query.username || "");
    const incoming = incomingRaw.trim().toLowerCase();

    const allUsers = await User.find({}, "username _id");
    const matchedUser = allUsers.find(
      (u) =>
        typeof u.username === "string" &&
        u.username.trim().toLowerCase() === incoming,
    );

    if (!matchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: matchedUser._id })
      .populate("userId")
      .exec();

    if (!userProfile) {
      console.log("Profile not found for user:", matchedUser.username);
      return res.status(404).json({ message: "Profile not found" });
    }

    // Success logging
    console.log("From ServerSide:", matchedUser.username);
    res.status(200).json({ userProfile });
  } catch (error) {
    console.error(" Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
