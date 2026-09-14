import type { Request, Response } from "express";
import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  isProductInWishlist,
  removeFromWishlist,
} from "../services/wishlistService.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function getAuthenticatedUserId(req: Request): string | null {
  const userId = req.user?.userId;

  if (!userId || typeof userId !== "string") {
    return null;
  }

  return userId;
}

export async function getMyWishlist(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const wishlist = await getWishlist(userId);

    return successResponse(res, wishlist, "Wishlist retrieved successfully");
  } catch (error) {
    console.error("Get wishlist error:", error);

    return errorResponse(res, "Failed to retrieve wishlist", 500);
  }
}

export async function addWishlistItem(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { productId } = req.body;

    if (!productId || typeof productId !== "string") {
      return errorResponse(res, "Product ID is required", 400);
    }

    const wishlistItem = await addToWishlist(userId, productId);

    return successResponse(
      res,
      wishlistItem,
      "Product added to wishlist successfully",
      201,
    );
  } catch (error) {
    console.error("Add wishlist item error:", error);

    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse(res, "Product not found", 404);
    }

    return errorResponse(res, "Failed to add product to wishlist", 500);
  }
}

export async function removeWishlistItem(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { productId } = req.params;

    if (!productId || typeof productId !== "string") {
      return errorResponse(res, "Product ID is required", 400);
    }

    const removedItem = await removeFromWishlist(userId, productId);

    return successResponse(
      res,
      removedItem,
      "Product removed from wishlist successfully",
    );
  } catch (error) {
    console.error("Remove wishlist item error:", error);

    if (
      error instanceof Error &&
      error.message === "Product is not in your wishlist"
    ) {
      return errorResponse(res, "Product is not in your wishlist", 404);
    }

    return errorResponse(res, "Failed to remove product from wishlist", 500);
  }
}

export async function checkWishlistItem(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { productId } = req.params;

    if (!productId || typeof productId !== "string") {
      return errorResponse(res, "Product ID is required", 400);
    }

    const inWishlist = await isProductInWishlist(userId, productId);

    return successResponse(
      res,
      {
        productId,
        inWishlist,
      },
      "Wishlist status retrieved successfully",
    );
  } catch (error) {
    console.error("Check wishlist error:", error);

    return errorResponse(res, "Failed to check wishlist status", 500);
  }
}

export async function clearMyWishlist(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return errorResponse(res, "Authentication required", 401);
    }

    await clearWishlist(userId);

    return successResponse(res, null, "Wishlist cleared successfully");
  } catch (error) {
    console.error("Clear wishlist error:", error);

    return errorResponse(res, "Failed to clear wishlist", 500);
  }
}
