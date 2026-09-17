import { Router } from "express";

import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/settingsController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getAdminSettings);
router.put("/", updateAdminSettings);

export default router;
