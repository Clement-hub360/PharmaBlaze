import type { Request, Response } from "express";
import { getInventory, updateStock } from "../services/inventoryService.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getInventoryController(req: Request, res: Response) {
  try {
    const inventory = await getInventory();

    return successResponse(res, inventory, "Inventory retrieved successfully");
  } catch (error) {
    console.error("Get inventory error:", error);

    return errorResponse(res, "Failed to retrieve inventory", 500);
  }
}

export async function updateInventoryStock(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { quantityDelta } = req.body;

    if (typeof id !== "string" || id.trim() === "") {
      return errorResponse(res, "Product ID is required", 400);
    }

    if (
      typeof quantityDelta !== "number" ||
      !Number.isInteger(quantityDelta) ||
      quantityDelta === 0
    ) {
      return errorResponse(
        res,
        "quantityDelta must be a non-zero integer",
        400,
      );
    }

    const updatedProduct = await updateStock(id, quantityDelta);

    if (!updatedProduct) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(
      res,
      updatedProduct,
      "Inventory stock updated successfully",
    );
  } catch (error) {
    console.error("Update inventory stock error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update inventory stock";

    return errorResponse(res, message, 400);
  }
}
