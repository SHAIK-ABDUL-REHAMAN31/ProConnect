import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import { UnauthorizedError } from "../errors/AppError.js";
import User from "../../modules/users/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.body && req.body.token) {
      token = req.body.token;
    } else if (req.query && req.query.token) {
      // SECURITY NOTE: Query string tokens leak into server logs, browser history, and Referer headers.
      // This path is retained for legacy backward compatibility only and should be migrated to Authorization header.
      console.warn(`[AUTH DEPRECATION] Token sent via query string on ${req.method} ${req.path}. Migrate to Authorization header.`);
      token = req.query.token;
    }

    if (!token) {
      return next(new UnauthorizedError("Authentication token is missing."));
    }

    // Support both JWT verification and legacy hex tokens for seamless backward compatibility
    let decodedUser = null;
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      decodedUser = await User.findById(decoded.id).select("-password");
    } catch {
      // Fallback check for legacy crypto hex tokens
      decodedUser = await User.findOne({ token }).select("-password");
    }

    if (!decodedUser) {
      return next(new UnauthorizedError("Invalid or expired session token."));
    }

    req.user = decodedUser;
    next();
  } catch (error) {
    next(error);
  }
};
