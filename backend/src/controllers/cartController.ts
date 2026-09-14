import type { Request, Response } from "express";
import {
  addItemToCart,
  clearCart,
  getOrCreateCart,
  getCartByUserId,
  removeCartItem,
  updateCartItem,
} from "../services/cartService.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function getAuthenticatedUserId(req: Request): string | null {
  return req.user?.userId ?? null;
}

export async function getMyCart(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const cart = await getOrCreateCart(userId);

    return successResponse(res, cart, "Cart retrieved successfully");
  } catch (error) {
    console.error("Get cart error:", error);
    return errorResponse(res, "Failed to retrieve cart", 500);
  }
}

export async function addCartItem(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { productId, quantity } = req.body;

    if (typeof productId !== "string" || productId.trim() === "") {
      return errorResponse(res, "Product ID is required", 400);
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return errorResponse(
        res,
        "Quantity must be a whole number greater than 0",
        400,
      );
    }

    const cart = await addItemToCart(userId, productId.trim(), quantity);

    return successResponse(res, cart, "Product added to cart successfully");
  } catch (error) {
    console.error("Add cart item error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to add product to cart";

    if (
      message === "Product not found" ||
      message === "This product is not currently available" ||
      message === "This product is out of stock" ||
      message.startsWith("Only ")
    ) {
      return errorResponse(res, message, 400);
    }

    return errorResponse(res, "Failed to add product to cart", 500);
  }
}

export async function updateCartItemQuantity(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof productId !== "string" || productId.trim() === "") {
      return errorResponse(res, "Product ID is required", 400);
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return errorResponse(
        res,
        "Quantity must be a whole number greater than 0",
        400,
      );
    }

    const cart = await updateCartItem(userId, productId.trim(), quantity);

    return successResponse(res, cart, "Cart item updated successfully");
  } catch (error) {
    console.error("Update cart item error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update cart item";

    if (
      message === "Cart not found" ||
      message === "Cart item not found" ||
      message === "This product is no longer available" ||
      message.startsWith("Only ")
    ) {
      return errorResponse(res, message, 400);
    }

    return errorResponse(res, "Failed to update cart item", 500);
  }
}

export async function removeItemFromCart(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { productId } = req.params;

    if (typeof productId !== "string" || productId.trim() === "") {
      return errorResponse(res, "Product ID is required", 400);
    }

    const cart = await removeCartItem(userId, productId.trim());

    return successResponse(res, cart, "Product removed from cart successfully");
  } catch (error) {
    console.error("Remove cart item error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove product from cart";

    if (message === "Cart not found" || message === "Cart item not found") {
      return errorResponse(res, message, 404);
    }

    return errorResponse(res, "Failed to remove product from cart", 500);
  }
}

export async function clearMyCart(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const cart = await clearCart(userId);

    return successResponse(res, cart, "Cart cleared successfully");
  } catch (error) {
    console.error("Clear cart error:", error);
    return errorResponse(res, "Failed to clear cart", 500);
  }
}
