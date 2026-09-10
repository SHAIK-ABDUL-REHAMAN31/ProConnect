import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { userRepository } from "../users/user.repository.js";
import { profileRepository } from "../profiles/profile.repository.js";
import EmailVerification from "./emailVerification.model.js";
import { verifyEmailRealWorldDns } from "../../infrastructure/email/dnsValidator.js";
import emailService from "../../infrastructure/email/emailService.js";
import { enqueueEmail } from "../../infrastructure/queues/emailQueue.js";
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

  /**
   * Check whether an email domain exists in the real world via DNS MX records.
   */
  async checkEmailDomain(email) {
    if (!email) {
      throw new BadRequestError("Email address is required.");
    }
    return await verifyEmailRealWorldDns(email);
  }

  /**
   * Check username availability in real-time with format & reserved checks.
   */
  async checkUsername(username) {
    if (!username) {
      throw new BadRequestError("Username is required.");
    }
    const clean = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(clean)) {
      return {
        available: false,
        message: "Username must be 3-20 characters (letters, numbers, _ only).",
      };
    }

    const reservedUsernames = [
      "admin",
      "administrator",
      "root",
      "support",
      "help",
      "api",
      "proconnect",
      "system",
      "auth",
      "login",
      "register",
      "null",
      "undefined",
      "official",
    ];
    if (reservedUsernames.includes(clean)) {
      return {
        available: false,
        message: "This username is reserved. Please choose another.",
      };
    }

    const existing = await userRepository.findByUsername(clean);
    if (existing) {
      return {
        available: false,
        message: "Username already exists.",
      };
    }

    return {
      available: true,
      message: "Username is available!",
    };
  }

  /**
   * Send a 6-digit OTP verification email via Nodemailer after DNS validation.
   */
  async sendVerificationOtp({ email, name = "Professional" }) {
    if (!email) {
      throw new BadRequestError("Email is required.");
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify email domain exists in the real world via DNS
    const dnsResult = await verifyEmailRealWorldDns(cleanEmail);
    if (!dnsResult.isValid) {
      throw new BadRequestError(dnsResult.reason || "Invalid or non-existent email domain.");
    }

    // 2. Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Clear existing pending verifications for this email
    await EmailVerification.deleteMany({ email: cleanEmail });

    // 4. Save verification record (expires in 10 minutes)
    await EmailVerification.create({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
      attempts: 0,
    });

    // 5. Asynchronously enqueue verification email via Redis Queue
    const queueResult = await enqueueEmail({
      type: "verification_otp",
      to: cleanEmail,
      name,
      otp,
    });

    return {
      email: cleanEmail,
      message: "Verification code sent to your email address.",
      status: queueResult.status || "queued",
      domain: dnsResult.domain,
    };
  }

  /**
   * Verify the 6-digit OTP code submitted by the user.
   */
  async verifyOtp({ email, otp }) {
    if (!email || !otp) {
      throw new BadRequestError("Email and 6-digit verification code are required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = await EmailVerification.findOne({
      email: cleanEmail,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!record) {
      throw new BadRequestError("No pending verification found or code has expired. Please request a new code.");
    }

    if (new Date() > record.expiresAt) {
      await EmailVerification.deleteOne({ _id: record._id });
      throw new BadRequestError("Verification code has expired. Please request a new code.");
    }

    if (record.attempts >= 5) {
      await EmailVerification.deleteOne({ _id: record._id });
      throw new BadRequestError("Too many failed attempts. Please request a new verification code.");
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      throw new BadRequestError(`Invalid verification code. ${remaining} attempts remaining.`);
    }

    // Mark verification as complete
    record.verified = true;
    await record.save();

    // If user already exists, update their isEmailVerified flag
    const user = await userRepository.findByEmail(cleanEmail);
    if (user) {
      user.isEmailVerified = true;
      await user.save();
    }

    return {
      verified: true,
      email: cleanEmail,
      message: "Email successfully verified!",
    };
  }

  /**
   * User registration with real-world DNS domain checking and optional OTP verification state.
   */
  async register({ name, email, username, password }) {
    if (!name || !email || !username || !password) {
      throw new BadRequestError("All registration fields are required.");
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Validate real-world email existence via DNS
    const dnsResult = await verifyEmailRealWorldDns(cleanEmail);
    if (!dnsResult.isValid) {
      throw new BadRequestError(dnsResult.reason || "Invalid email domain. Please use a valid, active email address.");
    }

    const existingEmail = await userRepository.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new BadRequestError("An account with this email already exists.");
    }

    const existingUsername = await userRepository.findByUsername(cleanUsername);
    if (existingUsername) {
      throw new BadRequestError("This username is already taken.");
    }

    // Enforce email OTP verification before creating the account
    const verifiedRecord = await EmailVerification.findOne({
      email: cleanEmail,
      verified: true,
    });
    if (!verifiedRecord) {
      throw new BadRequestError("Email verification required. Please verify the 6-digit code sent to your email.");
    }
    const isEmailVerified = true;

    const hashedPassword = await bcrypt.hash(password, 10);
    const legacyToken = crypto.randomBytes(32).toString("hex");

    // Strictly enforce role to USER on registration to prevent privilege escalation
    const user = await userRepository.create({
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
      role: "USER",
      token: legacyToken,
      authProvider: "local",
      isEmailVerified,
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
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
      token: tokens.accessToken, // Backward compatible token
    };
  }

  /**
   * Traditional email/username and password login.
   */
  async login({ email, username, password }) {
    const identifier = (email || username || "").trim();
    if (!identifier || !password) {
      throw new BadRequestError("Email or username and password are required.");
    }

    const user = await userRepository.findByIdentifier(identifier, true);
    if (!user) {
      throw new UnauthorizedError("Invalid email/username or password credentials.");
    }

    if (!user.password && user.authProvider === "google") {
      throw new BadRequestError("This account was created with Google. Please use 'Continue with Google' to sign in.");
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
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
      token: tokens.accessToken,
      message: "Login successful.",
    };
  }

  /**
   * Google OAuth 2.0 Sign-In and Auto-Provisioning.
   * Strictly validates Google ID Token credentials against Google tokeninfo.
   */
  async googleAuth({ credential } = {}) {
    let googleUser = null;

    if (!credential) {
      throw new BadRequestError("Valid Google ID token credential is required.");
    }

    // Verify Google ID Token via Google's tokeninfo API
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || "Google token verification failed.");
      }
      const data = await response.json();

      // Optional: If GOOGLE_CLIENT_ID is configured, enforce audience check
      if (ENV.GOOGLE_CLIENT_ID && data.aud && data.aud !== ENV.GOOGLE_CLIENT_ID) {
        throw new Error("Google token audience mismatch.");
      }

      googleUser = {
        googleId: data.sub,
        email: data.email?.toLowerCase().trim(),
        name: data.name || data.given_name || "Google Professional",
        picture: data.picture || "default.jpg",
        emailVerified: data.email_verified === "true" || data.email_verified === true,
      };
    } catch (err) {
      console.error("[GoogleAuth] Token verification failed:", err.message);
      throw new UnauthorizedError(`Google authentication failed: ${err.message}`);
    }

    if (!googleUser || !googleUser.email) {
      throw new BadRequestError("Failed to retrieve valid email address from Google profile.");
    }

    // 2. Check if user already exists
    let user = await userRepository.findByEmail(googleUser.email);

    if (user) {
      // Existing user: Link Google ID and mark email verified
      user.googleId = googleUser.googleId || user.googleId;
      user.isEmailVerified = true;
      if ((!user.profilePicture || user.profilePicture === "default.jpg") && googleUser.picture) {
        user.profilePicture = googleUser.picture;
      }
      const legacyToken = crypto.randomBytes(32).toString("hex");
      user.token = legacyToken;
      await user.save();
    } else {
      // 3. New user: Generate unique username & create account
      let baseUsername = (
        googleUser.name.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() ||
        googleUser.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
      ).slice(0, 15);

      if (baseUsername.length < 3) {
        baseUsername = `user_${baseUsername}`;
      }

      let uniqueUsername = baseUsername;
      let count = 1;
      while (await userRepository.findByUsername(uniqueUsername)) {
        uniqueUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        count++;
        if (count > 20) {
          uniqueUsername = `pro_${Date.now().toString().slice(-6)}`;
          break;
        }
      }

      const legacyToken = crypto.randomBytes(32).toString("hex");
      user = await userRepository.create({
        name: googleUser.name,
        email: googleUser.email,
        username: uniqueUsername,
        role: "USER",
        authProvider: "google",
        googleId: googleUser.googleId,
        isEmailVerified: true,
        profilePicture: googleUser.picture || "default.jpg",
        token: legacyToken,
      });

      // Create default empty profile
      await profileRepository.create({ userId: user._id });
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        headline: user.headline || "",
        isEmailVerified: true,
        authProvider: user.authProvider || "google",
      },
      ...tokens,
      token: tokens.accessToken,
      message: "Google authentication successful.",
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
