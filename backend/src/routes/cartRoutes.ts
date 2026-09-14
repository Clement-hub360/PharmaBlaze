import { Router } from "express";

import {
  addCartItem,
  clearMyCart,
  getMyCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "../controllers/cartController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// All cart routes require the customer to be authenticated.
router.use(authenticate);

// Get the current user's cart
router.get("/", getMyCart);

// Add a product to the cart
router.post("/items", addCartItem);

// Update a cart item's quantity
router.patch("/items/:productId", updateCartItemQuantity);

// Remove a product from the cart
router.delete("/items/:productId", removeItemFromCart);

// Remove all products from the cart
router.delete("/", clearMyCart);

export default router;
