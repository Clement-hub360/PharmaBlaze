import type { Request, Response } from "express";
import type { PrescriptionStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionForUser,
  getPrescriptionsForUser,
  updatePrescriptionStatus,
} from "../services/prescriptionService.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
    email?: string;
    role?: string;
  };

  file?: Express.Multer.File;
};

const allowedStatuses: PrescriptionStatus[] = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
  "FULFILLED",
];

function getFileExtension(file: Express.Multer.File): string {
  switch (file.mimetype) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "image/webp":
      return ".webp";

    case "application/pdf":
      return ".pdf";

    default:
      return path.extname(file.originalname).toLowerCase() || "";
  }
}

async function savePrescriptionFile(
  file: Express.Multer.File,
): Promise<string> {
  const uploadDirectory = path.join(process.cwd(), "uploads", "prescriptions");

  await mkdir(uploadDirectory, {
    recursive: true,
  });

  const extension = getFileExtension(file);

  const filename = `${randomUUID()}${extension}`;

  const filePath = path.join(uploadDirectory, filename);

  await writeFile(filePath, file.buffer);

  return `/uploads/prescriptions/${filename}`;
}

/* ============================================================
   ADMIN
   ============================================================ */

export async function getPrescriptions(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const role = request.user?.role;

    if (role === "ADMIN") {
      const prescriptions = await getAllPrescriptions();

      successResponse(
        res,
        prescriptions,
        "Prescriptions retrieved successfully",
      );

      return;
    }

    const userId = request.user?.userId;

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

    errorResponse(res, "Failed to retrieve prescriptions", 500);
  }
}

export async function getSinglePrescription(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      errorResponse(res, "Prescription ID is required", 400);

      return;
    }

    if (request.user?.role === "ADMIN") {
      const prescription = await getPrescriptionById(id);

      if (!prescription) {
        errorResponse(res, "Prescription not found", 404);

        return;
      }

      successResponse(res, prescription, "Prescription retrieved successfully");

      return;
    }

    const userId = request.user?.userId;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);

      return;
    }

    const prescription = await getPrescriptionForUser(userId, id);

    if (!prescription) {
      errorResponse(res, "Prescription not found", 404);

      return;
    }

    successResponse(res, prescription, "Prescription retrieved successfully");
  } catch (error) {
    console.error("Get prescription error:", error);

    errorResponse(res, "Failed to retrieve prescription", 500);
  }
}

export async function changePrescriptionStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const { id } = req.params;

    const { status } = req.body as {
      status?: PrescriptionStatus;
    };

    if (typeof id !== "string" || id.trim() === "") {
      errorResponse(res, "Prescription ID is required", 400);

      return;
    }

    if (!status || !allowedStatuses.includes(status)) {
      errorResponse(res, "Invalid prescription status", 400);

      return;
    }

    const prescription = await getPrescriptionById(id);

    if (!prescription) {
      errorResponse(res, "Prescription not found", 404);

      return;
    }

    const updatedPrescription = await updatePrescriptionStatus(
      id,
      status,
      request.user?.userId,
    );

    successResponse(
      res,
      updatedPrescription,
      "Prescription status updated successfully",
    );
  } catch (error) {
    console.error("Update prescription status error:", error);

    errorResponse(res, "Failed to update prescription status", 500);
  }
}

/* ============================================================
   CUSTOMER
   ============================================================ */

export async function getMyPrescriptions(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const userId = request.user?.userId;

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
    console.error("Get my prescriptions error:", error);

    errorResponse(res, "Failed to retrieve your prescriptions", 500);
  }
}

export async function getMyPrescription(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const userId = request.user?.userId;

    const { id } = req.params;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);

      return;
    }

    if (typeof id !== "string" || id.trim() === "") {
      errorResponse(res, "Prescription ID is required", 400);

      return;
    }

    const prescription = await getPrescriptionForUser(userId, id);

    if (!prescription) {
      errorResponse(res, "Prescription not found", 404);

      return;
    }

    successResponse(res, prescription, "Prescription retrieved successfully");
  } catch (error) {
    console.error("Get my prescription error:", error);

    errorResponse(res, "Failed to retrieve prescription", 500);
  }
}

export async function submitPrescription(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const userId = request.user?.userId;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);

      return;
    }

    const file = request.file;

    if (!file) {
      errorResponse(res, "Prescription file is required", 400);

      return;
    }

    if (req.body?.notes !== undefined && typeof req.body.notes !== "string") {
      errorResponse(res, "Prescription notes must be text", 400);

      return;
    }

    const notes =
      typeof req.body?.notes === "string" ? req.body.notes.trim() : undefined;

    const fileUrl = await savePrescriptionFile(file);

    const prescription = await createPrescription(userId, {
      fileUrl,
      ...(notes ? { notes } : {}),
    });

    successResponse(
      res,
      prescription,
      "Prescription submitted successfully",
      201,
    );
  } catch (error) {
    console.error("Submit prescription error:", error);

    errorResponse(res, "Failed to submit prescription", 500);
  }
}
