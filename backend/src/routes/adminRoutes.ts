import { Router } from "express";

import { getAdminDashboard } from "../controllers/adminController.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/dashboard", getAdminDashboard);

export default router;