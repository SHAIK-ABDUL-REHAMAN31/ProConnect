import { ForbiddenError } from "../errors/AppError.js";

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError("Access denied. Authentication required."));
    }

    const userRole = req.user.role || "USER";
    if (!roles.includes(userRole) && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return next(
        new ForbiddenError(
          `Action requires one of the following roles: ${roles.join(", ")}`
        )
      );
    }

    next();
  };
};
