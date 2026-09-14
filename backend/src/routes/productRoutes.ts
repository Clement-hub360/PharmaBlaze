import { Router } from "express";
import {
  createNewProduct,
  getFeatured,
  getProduct,
  getProductBySlugController,
  getProducts,
  removeProduct,
  updateExistingProduct,
} from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public product routes
router.get("/", getProducts);
router.get("/featured", getFeatured);
router.get("/slug/:slug", getProductBySlugController);
router.get("/:id", getProduct);

// Admin product routes
router.post("/", authenticate, requireAdmin, createNewProduct);

router.patch("/:id", authenticate, requireAdmin, updateExistingProduct);

router.delete("/:id", authenticate, requireAdmin, removeProduct);

export default router;
