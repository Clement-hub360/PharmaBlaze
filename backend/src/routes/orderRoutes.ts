import { Router } from "express";

import {
  changeOrderStatus,
  createNewOrder,
  getAdminOrders,
  getSingleOrder,
  getUserOrders,
} from "../controllers/orderController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

/*
 * CUSTOMER ROUTES
 */

/*
 * Create a new order.
 */
router.post("/", authenticate, createNewOrder);

/*
 * Get the currently authenticated
 * customer's orders.
 *
 * This must come before /:id.
 */
router.get("/my-orders", authenticate, getUserOrders);

/*
 * ADMIN ROUTES
 */

/*
 * Get all orders.
 */
router.get("/", authenticate, requireAdmin, getAdminOrders);

/*
 * Update order status.
 */
router.patch("/:id/status", authenticate, requireAdmin, changeOrderStatus);

/*
 * SINGLE ORDER
 *
 * Customers can only view their own
 * order. Admins can view any order.
 */
router.get("/:id", authenticate, getSingleOrder);

export default router;
