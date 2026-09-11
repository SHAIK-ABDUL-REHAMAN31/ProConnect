import mongoose from "mongoose";

// ───────────────────────────────────────────────────────────
// Refresh Token Model — Supports Token Rotation & Reuse Detection
// ───────────────────────────────────────────────────────────
// Each refresh token belongs to a "family". When a token is rotated (used to
// get a new pair), the old one is invalidated. If an already-invalidated token
// is presented (reuse), the entire family is revoked — indicating a stolen
// token was replayed by an attacker.

const refreshTokenSchema = new mongoose.Schema(
  {
    // The hashed refresh token (never store raw JWTs)
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    // The user this token belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Token family ID — all tokens from the same login session share a family
    family: {
      type: String,
      required: true,
      index: true,
    },
    // Whether this token has already been used (rotated)
    isUsed: {
      type: Boolean,
      default: false,
    },
    // Whether this token has been explicitly revoked
    isRevoked: {
      type: Boolean,
      default: false,
    },
    // Device/client info for audit trail
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    // When the JWT itself expires (mirrors JWT exp claim)
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL auto-cleanup
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups
refreshTokenSchema.index({ userId: 1, family: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
