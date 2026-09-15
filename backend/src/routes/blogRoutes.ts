import { Router } from "express";
import multer from "multer";

import {
  createNewBlogPost,
  getBlogPostFromSlug,
  getBlogPosts,
  getPublishedPosts,
  getSingleBlogPost,
  removeBlogPost,
  updateExistingBlogPost,
} from "../controllers/blogController.js";

import { uploadBlogImage } from "../controllers/blogUploadController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

const blogImageUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("Only JPG, PNG, and WEBP images are allowed."));

      return;
    }

    callback(null, true);
  },
});

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

/*
 * Blog image upload
 */
router.post("/upload-image", blogImageUpload.single("image"), uploadBlogImage);

router.get("/", getBlogPosts);

router.get("/:id", getSingleBlogPost);

router.post("/", createNewBlogPost);

router.patch("/:id", updateExistingBlogPost);

router.delete("/:id", removeBlogPost);

export default router;
