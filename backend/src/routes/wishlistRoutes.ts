import { Router } from "express";
import {
  addWishlistItem,
  checkWishlistItem,
  clearMyWishlist,
  getMyWishlist,
  removeWishlistItem,
} from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getMyWishlist);

router.get("/check/:productId", checkWishlistItem);

router.post("/items", addWishlistItem);

router.delete("/items/:productId", removeWishlistItem);

router.delete("/", clearMyWishlist);

export default router;
