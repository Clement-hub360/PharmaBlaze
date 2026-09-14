import type { Request, Response } from "express";

import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersForUser,
  updateOrderStatus,
} from "../services/orderService.js";

import type {
  CreateOrderInput,
  OrderStatus,
} from "../services/orderService.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

const VALID_PAYMENT_METHODS = ["PAY_ON_CONFIRMATION", "ONLINE"];

export async function createNewOrder(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const input = req.body as CreateOrderInput;

    if (!input || typeof input !== "object") {
      return errorResponse(res, "Invalid order request", 400);
    }

    if (typeof input.customerName !== "string" || !input.customerName.trim()) {
      return errorResponse(res, "Customer name is required", 400);
    }

    if (
      typeof input.customerEmail !== "string" ||
      !input.customerEmail.trim()
    ) {
      return errorResponse(res, "Customer email is required", 400);
    }

    if (
      typeof input.customerPhone !== "string" ||
      !input.customerPhone.trim()
    ) {
      return errorResponse(res, "Customer phone is required", 400);
    }

    if (
      input.deliveryMethod !== "DELIVERY" &&
      input.deliveryMethod !== "PICKUP"
    ) {
      return errorResponse(res, "Invalid delivery method", 400);
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
      return errorResponse(res, "At least one order item is required", 400);
    }

    if (
      input.deliveryMethod === "DELIVERY" &&
      (typeof input.deliveryAddress !== "string" ||
        !input.deliveryAddress.trim())
    ) {
      return errorResponse(
        res,
        "Delivery address is required for delivery orders",
        400,
      );
    }

    if (
      input.paymentMethod !== undefined &&
      (typeof input.paymentMethod !== "string" ||
        !VALID_PAYMENT_METHODS.includes(input.paymentMethod))
    ) {
      return errorResponse(res, "Invalid payment method", 400);
    }

    for (const item of input.items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !item.productId.trim()
      ) {
        return errorResponse(
          res,
          "Every order item must have a valid product ID",
          400,
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return errorResponse(
          res,
          "Every order item quantity must be a positive whole number",
          400,
        );
      }
    }

    const order = await createOrder(req.user.userId, input);

    return successResponse(res, order, "Order created successfully", 201);
  } catch (error) {
    console.error("Create order error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create order";

    const expectedErrors = [
      "Product not found",
      "currently unavailable",
      "Insufficient stock",
      "Stock changed while",
      "Every order item",
      "Customer name",
      "Customer email",
      "Customer phone",
      "Invalid delivery method",
      "Invalid payment method",
      "Delivery address is required",
      "At least one order item",
      "Authentication required",
    ];

    const isExpectedError = expectedErrors.some((errorText) =>
      message.includes(errorText),
    );

    return errorResponse(
      res,
      isExpectedError ? message : "Failed to create order",
      isExpectedError ? 400 : 500,
    );
  }
}

export async function getUserOrders(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const orders = await getOrdersForUser(req.user.userId);

    return successResponse(res, orders, "Orders retrieved successfully");
  } catch (error) {
    console.error("Get user orders error:", error);

    return errorResponse(res, "Failed to retrieve orders", 500);
  }
}

export async function getAdminOrders(_req: Request, res: Response) {
  try {
    const orders = await getAllOrders();

    return successResponse(res, orders, "All orders retrieved successfully");
  } catch (error) {
    console.error("Get admin orders error:", error);

    return errorResponse(res, "Failed to retrieve orders", 500);
  }
}

export async function getSingleOrder(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Order ID is required", 400);
    }

    const order = await getOrderById(id);

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    const isAdmin = req.user.role === "ADMIN";

    if (!isAdmin && order.userId !== req.user.userId) {
      return errorResponse(
        res,
        "You are not authorized to view this order",
        403,
      );
    }

    return successResponse(res, order, "Order retrieved successfully");
  } catch (error) {
    console.error("Get single order error:", error);

    return errorResponse(res, "Failed to retrieve order", 500);
  }
}

export async function changeOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { status } = req.body as {
      status?: OrderStatus;
    };

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Order ID is required", 400);
    }

    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return errorResponse(res, "Invalid order status", 400);
    }

    const order = await updateOrderStatus(id, status);

    return successResponse(res, order, "Order status updated successfully");
  } catch (error) {
    console.error("Update order status error:", error);

    return errorResponse(res, "Failed to update order status", 500);
  }
}
