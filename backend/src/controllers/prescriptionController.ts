import type { NextFunction, Request, Response } from "express";
import type { PrescriptionStatus } from "@prisma/client";

import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionForUser,
  getPrescriptionsForUser,
  updatePrescriptionStatus,
} from "../services/prescriptionService.js";

import {
  errorResponse,
  successResponse,
} from "../utils/apiResponse.js";

type AuthenticatedUser = {
  userId?: string;
  email?: string;
  role?: string;
};

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

const allowedStatuses: PrescriptionStatus[] = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
  "FULFILLED",
];

/* ============================================================
   ADMIN
   ============================================================ */

export async function getPrescriptions(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const role = req.user?.role;

    if (role === "ADMIN") {
      const prescriptions = await getAllPrescriptions();

      successResponse(
        res,
        prescriptions,
        "Prescriptions retrieved successfully",
      );

      return;
    }

    const userId = req.user?.userId;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const prescriptions = await getPrescriptionsForUser(userId);

    successResponse(
      res,
      prescriptions,
      "Your prescriptions retrieved successfully",
    );
  } catch (error) {
    console.error("Get prescriptions error:", error);

    errorResponse(
      res,
      "Failed to retrieve prescriptions",
      500,
    );
  }
}

export async function getSinglePrescription(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      errorResponse(
        res,
        "Prescription ID is required",
        400,
      );
      return;
    }

    if (req.user?.role === "ADMIN") {
      const prescription = await getPrescriptionById(id);

      if (!prescription) {
        errorResponse(
          res,
          "Prescription not found",
          404,
        );
        return;
      }

      successResponse(
        res,
        prescription,
        "Prescription retrieved successfully",
      );

      return;
    }

    const userId = req.user?.userId;

    if (!userId || userId.trim() === "") {
      errorResponse(
        res,
        "Authentication required",
        401,
      );
      return;
    }

    const prescription = await getPrescriptionForUser(
      userId,
      id,
    );

    if (!prescription) {
      errorResponse(
        res,
        "Prescription not found",
        404,
      );
      return;
    }

    successResponse(
      res,
      prescription,
      "Prescription retrieved successfully",
    );
  } catch (error) {
    console.error("Get prescription error:", error);

    errorResponse(
      res,
      "Failed to retrieve prescription",
      500,
    );
  }
}

export async function changePrescriptionStatus(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    const { status } = req.body as {
      status?: PrescriptionStatus;
    };

    if (typeof id !== "string" || id.trim() === "") {
      errorResponse(
        res,
        "Prescription ID is required",
        400,
      );
      return;
    }

    if (!status || !allowedStatuses.includes(status)) {
      errorResponse(
        res,
        "Invalid prescription status",
        400,
      );
      return;
    }

    const prescription = await getPrescriptionById(id);

    if (!prescription) {
      errorResponse(
        res,
        "Prescription not found",
        404,
      );
      return;
    }

    const updatedPrescription =
      await updatePrescriptionStatus(
        id,
        status,
        req.user?.userId,
      );

    successResponse(
      res,
      updatedPrescription,
      "Prescription status updated successfully",
    );
  } catch (error) {
    console.error(
      "Update prescription status error:",
      error,
    );

    errorResponse(
      res,
      "Failed to update prescription status",
      500,
    );
  }
}

/* ============================================================
   CUSTOMER
   ============================================================ */

export async function getMyPrescriptions(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId || userId.trim() === "") {
      errorResponse(
        res,
        "Authentication required",
        401,
      );
      return;
    }

    const prescriptions =
      await getPrescriptionsForUser(userId);

    successResponse(
      res,
      prescriptions,
      "Your prescriptions retrieved successfully",
    );
  } catch (error) {
    console.error(
      "Get my prescriptions error:",
      error,
    );

    errorResponse(
      res,
      "Failed to retrieve your prescriptions",
      500,
    );
  }
}

export async function getMyPrescription(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || userId.trim() === "") {
      errorResponse(
        res,
        "Authentication required",
        401,
      );
      return;
    }

    if (typeof id !== "string" || id.trim() === "") {
      errorResponse(
        res,
        "Prescription ID is required",
        400,
      );
      return;
    }

    const prescription =
      await getPrescriptionForUser(userId, id);

    if (!prescription) {
      errorResponse(
        res,
        "Prescription not found",
        404,
      );
      return;
    }

    successResponse(
      res,
      prescription,
      "Prescription retrieved successfully",
    );
  } catch (error) {
    console.error(
      "Get my prescription error:",
      error,
    );

    errorResponse(
      res,
      "Failed to retrieve prescription",
      500,
    );
  }
}

export async function submitPrescription(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId || userId.trim() === "") {
      errorResponse(
        res,
        "Authentication required",
        401,
      );
      return;
    }

    const { fileUrl, notes } = req.body as {
      fileUrl?: string;
      notes?: string;
    };

    if (
      typeof fileUrl !== "string" ||
      fileUrl.trim() === ""
    ) {
      errorResponse(
        res,
        "Prescription file is required",
        400,
      );
      return;
    }

    if (
      notes !== undefined &&
      typeof notes !== "string"
    ) {
      errorResponse(
        res,
        "Prescription notes must be text",
        400,
      );
      return;
    }

    const prescription = await createPrescription(
      userId,
      {
        fileUrl,
        ...(notes !== undefined ? { notes } : {}),
      },
    );

    successResponse(
      res,
      prescription,
      "Prescription submitted successfully",
      201,
    );
  } catch (error) {
    console.error(
      "Submit prescription error:",
      error,
    );

    errorResponse(
      res,
      "Failed to submit prescription",
      500,
    );
  }
}
