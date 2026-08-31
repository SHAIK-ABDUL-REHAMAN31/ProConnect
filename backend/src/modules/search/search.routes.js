import { Router } from "express";
import { searchController } from "./search.controller.js";

const router = Router();

router.get("/", searchController.search);

export default router;
