import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { userRepository } from "../users/user.repository.js";
import { profileRepository } from "../profiles/profile.repository.js";
import { BadRequestError, UnauthorizedError } from "../../core/errors/AppError.js";
import { ENV } from "../../config/env.js";
import cloudinary from "../../config/cloudinary.js";

export class AuthService {
  generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role || "USER",
    };

    const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  async register({ name, email, username, password, role = "USER" }) {
    if (!name || !email || !username || !password) {
      throw new BadRequestError("All registration fields are required.");
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingEmail = await userRepository.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new BadRequestError("An account with this email already exists.");
    }

    const existingUsername = await userRepository.findByUsername(cleanUsername);
    if (existingUsername) {
      throw new BadRequestError("This username is already taken.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const legacyToken = crypto.randomBytes(32).toString("hex");

    const user = await userRepository.create({
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
      role,
      token: legacyToken,
    });

    // Automatically create empty profile
    await profileRepository.create({ userId: user._id });

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      ...tokens,
      token: tokens.accessToken, // Backward compatible token
    };
  }

  async login({ email, username, password }) {
    const identifier = (email || username || "").trim();
    if (!identifier || !password) {
      throw new BadRequestError("Email or username and password are required.");
    }

    const user = await userRepository.findByIdentifier(identifier, true);
    if (!user) {
      throw new UnauthorizedError("Invalid email/username or password credentials.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password credentials.");
    }

    const legacyToken = crypto.randomBytes(32).toString("hex");
    user.token = legacyToken;
    await user.save();

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        headline: user.headline,
      },
      ...tokens,
      token: tokens.accessToken, // Backward compatible
      message: "Login successful.",
    };
  }

  async updateAvatar(userId, file) {
    if (!file) {
      throw new BadRequestError("No avatar file provided.");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User account not found.");
    }

    // Delete previous cloudinary image if custom
    if (user.profilePicture && user.profilePicture.includes("cloudinary.com")) {
      try {
        const parts = user.profilePicture.split("/");
        const uploadIdx = parts.indexOf("upload");
        if (uploadIdx !== -1) {
          const publicId = parts.slice(uploadIdx + 2).join("/").split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.warn("Could not delete old avatar image:", err.message);
      }
    }

    const newUrl = file.path;
    user.profilePicture = newUrl;
    await user.save();

    return {
      profilePicture: newUrl,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: newUrl,
      },
    };
  }
}

export const authService = new AuthService();
