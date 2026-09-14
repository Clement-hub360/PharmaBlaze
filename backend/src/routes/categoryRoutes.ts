import { Router } from "express";
import {
  createNewCategory,
  getActive,
  getCategories,
  getCategory,
  getCategoryBySlugController,
  removeCategory,
  updateExistingCategory,
} from "../controllers/categoryController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/active", getActive);
router.get("/slug/:slug", getCategoryBySlugController);
router.get("/:id", getCategory);

// Admin routes
router.post("/", authenticate, requireAdmin, createNewCategory);

router.patch("/:id", authenticate, requireAdmin, updateExistingCategory);

router.delete("/:id", authenticate, requireAdmin, removeCategory);

export default router;
