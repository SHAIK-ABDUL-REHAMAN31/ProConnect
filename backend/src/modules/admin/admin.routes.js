import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import { ROLES } from "../../../../shared/constants/roles.js";

const router = Router();

// User-facing report submission
router.post("/report", authenticate, adminController.createReport);

// Admin-only operations
router.get("/stats", authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), adminController.getStats);
router.get("/users", authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), adminController.getUsers);
router.patch("/users/:id/toggle", authenticate, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), adminController.toggleUser);
router.get("/reports", authenticate, requireRole(ROLES.ADMIN, ROLES.MODERATOR), adminController.getReports);
router.patch("/reports/:id/resolve", authenticate, requireRole(ROLES.ADMIN, ROLES.MODERATOR), adminController.resolveReport);

export default router;
