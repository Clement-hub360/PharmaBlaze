import { Router } from "express";

import {
  changeReviewStatus,
  createNewReview,
  getAdminReviews,
  getPublicReviews,
  getSingleReview,
  removeReview,
} from "../controllers/reviewController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public reviews
router.get("/approved", getPublicReviews);

// Customer submits a review
router.post("/", authenticate, createNewReview);

// Admin review management
router.get("/", authenticate, requireAdmin, getAdminReviews);
router.get("/:id", authenticate, requireAdmin, getSingleReview);
router.patch("/:id/status", authenticate, requireAdmin, changeReviewStatus);
router.delete("/:id", authenticate, requireAdmin, removeReview);

export default router;
