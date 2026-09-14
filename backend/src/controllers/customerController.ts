import type { Request, Response } from "express";

import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
} from "../services/customerService.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getCustomers(_req: Request, res: Response) {
  try {
    const customers = await getAllCustomers();

    return successResponse(res, customers, "Customers retrieved successfully");
  } catch (error) {
    console.error("Get customers error:", error);

    return errorResponse(res, "Failed to retrieve customers", 500);
  }
}

export async function getSingleCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Customer ID is required", 400);
    }

    const customer = await getCustomerById(id);

    if (!customer) {
      return errorResponse(res, "Customer not found", 404);
    }

    return successResponse(res, customer, "Customer retrieved successfully");
  } catch (error) {
    console.error("Get customer error:", error);

    return errorResponse(res, "Failed to retrieve customer", 500);
  }
}

export async function changeCustomerStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof id !== "string" || !id.trim()) {
      return errorResponse(res, "Customer ID is required", 400);
    }

    if (typeof active !== "boolean") {
      return errorResponse(
        res,
        "Customer active status must be true or false",
        400,
      );
    }

    const customer = await updateCustomerStatus(id, active);

    if (!customer) {
      return errorResponse(res, "Customer not found", 404);
    }

    return successResponse(
      res,
      customer,
      active
        ? "Customer activated successfully"
        : "Customer deactivated successfully",
    );
  } catch (error) {
    console.error("Change customer status error:", error);

    return errorResponse(res, "Failed to update customer status", 500);
  }
}
