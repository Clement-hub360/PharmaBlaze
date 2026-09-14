import type { Request, Response } from "express";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
} from "../services/productService.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getProducts(_req: Request, res: Response) {
  try {
    const products = await getAllProducts();

    return successResponse(res, products, "Products retrieved successfully");
  } catch (error) {
    console.error("Get products error:", error);

    return errorResponse(res, "Failed to retrieve products", 500);
  }
}

export async function getFeatured(_req: Request, res: Response) {
  try {
    const products = await getFeaturedProducts();

    return successResponse(
      res,
      products,
      "Featured products retrieved successfully",
    );
  } catch (error) {
    console.error("Get featured products error:", error);

    return errorResponse(res, "Failed to retrieve featured products", 500);
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Product ID is required", 400);
    }

    const product = await getProductById(id);

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, product, "Product retrieved successfully");
  } catch (error) {
    console.error("Get product error:", error);

    return errorResponse(res, "Failed to retrieve product", 500);
  }
}

export async function getProductBySlugController(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string" || !slug.trim()) {
      return errorResponse(res, "Product slug is required", 400);
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, product, "Product retrieved successfully");
  } catch (error) {
    console.error("Get product by slug error:", error);

    return errorResponse(res, "Failed to retrieve product", 500);
  }
}

export async function createNewProduct(req: Request, res: Response) {
  try {
    const product = await createProduct(req.body);

    return successResponse(res, product, "Product created successfully", 201);
  } catch (error) {
    console.error("Create product error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create product";

    return errorResponse(res, message, 400);
  }
}

export async function updateExistingProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Product ID is required", 400);
    }

    const product = await updateProduct(id, req.body);

    return successResponse(res, product, "Product updated successfully");
  } catch (error) {
    console.error("Update product error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update product";

    if (message === "Product not found") {
      return errorResponse(res, message, 404);
    }

    return errorResponse(res, message, 400);
  }
}

export async function removeProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Product ID is required", 400);
    }

    await deleteProduct(id);

    return successResponse(res, null, "Product deleted successfully");
  } catch (error) {
    console.error("Delete product error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete product";

    if (message === "Product not found") {
      return errorResponse(res, message, 404);
    }

    return errorResponse(
      res,
      "This product cannot be deleted because it may be connected to existing carts, orders, or other pharmacy records. Consider marking it inactive instead.",
      409,
    );
  }
}
