import { Router } from "express";

import {
  createNewBlogPost,
  getBlogPostFromSlug,
  getBlogPosts,
  getPublishedPosts,
  getSingleBlogPost,
  removeBlogPost,
  updateExistingBlogPost,
} from "../controllers/blogController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

/*
 * Public routes
 */
router.get("/published", getPublishedPosts);
router.get("/slug/:slug", getBlogPostFromSlug);

/*
 * Admin routes
 */
router.use(authenticate);
router.use(requireAdmin);

router.get("/", getBlogPosts);
router.get("/:id", getSingleBlogPost);

router.post("/", createNewBlogPost);

router.patch("/:id", updateExistingBlogPost);

router.delete("/:id", removeBlogPost);

export default router;
