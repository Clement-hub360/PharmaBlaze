import type { Request, Response } from "express";
import {
  createCategory,
  deleteCategory,
  getActiveCategories,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
} from "../services/categoryService.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await getAllCategories();

    return successResponse(
      res,
      categories,
      "Categories retrieved successfully",
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return errorResponse(res, "Failed to retrieve categories", 500);
  }
}

export async function getActive(_req: Request, res: Response) {
  try {
    const categories = await getActiveCategories();

    return successResponse(
      res,
      categories,
      "Active categories retrieved successfully",
    );
  } catch (error) {
    console.error("Get active categories error:", error);

    return errorResponse(res, "Failed to retrieve active categories", 500);
  }
}

export async function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return errorResponse(res, "Category ID is required", 400);
    }

    const category = await getCategoryById(id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(res, category, "Category retrieved successfully");
  } catch (error) {
    console.error("Get category error:", error);

    return errorResponse(res, "Failed to retrieve category", 500);
  }
}

export async function getCategoryBySlugController(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      return errorResponse(res, "Category slug is required", 400);
    }

    const category = await getCategoryBySlug(slug);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(res, category, "Category retrieved successfully");
  } catch (error) {
    console.error("Get category by slug error:", error);

    return errorResponse(res, "Failed to retrieve category", 500);
  }
}

export async function createNewCategory(req: Request, res: Response) {
  try {
    const category = await createCategory(req.body);

    return successResponse(res, category, "Category created successfully", 201);
  } catch (error) {
    console.error("Create category error:", error);

    return errorResponse(res, "Failed to create category", 500);
  }
}

export async function updateExistingCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return errorResponse(res, "Category ID is required", 400);
    }

    const category = await updateCategory(id, req.body);

    return successResponse(res, category, "Category updated successfully");
  } catch (error) {
    console.error("Update category error:", error);

    return errorResponse(res, "Failed to update category", 500);
  }
}

export async function removeCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return errorResponse(res, "Category ID is required", 400);
    }

    await deleteCategory(id);

    return successResponse(res, null, "Category deleted successfully");
  } catch (error) {
    console.error("Delete category error:", error);

    return errorResponse(res, "Failed to delete category", 500);
  }
}
