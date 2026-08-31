import { Router } from "express";
import savedItemController from "./savedItem.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, savedItemController.create);
router.get("/", authenticate, savedItemController.getAll);
router.delete("/:id", authenticate, savedItemController.remove);

export default router;
