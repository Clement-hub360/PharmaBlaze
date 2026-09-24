import type { Request, Response } from "express";
import type { PrescriptionStatus } from "../generated/prisma/enums.js";
import { randomUUID } from "node:crypto";
import path from "node:path";

import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionForUser,
  getPrescriptionsForUser,
  updatePrescriptionStatus,
} from "../services/prescriptionService.js";

import {
  deletePrescriptionFile,
  downloadPrescriptionFile,
  uploadPrescriptionFile,
} from "../services/supabaseStorageService.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: string;
  };
};

/**
 * Get all prescriptions.
 *
 * Admins can see every prescription.
 * Regular customers can only see their own prescriptions.
 */
export async function getPrescriptions(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    const userId = request.user?.userId;
    const role = request.user?.role;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const prescriptions =
      role === "ADMIN"
        ? await getAllPrescriptions()
        : await getPrescriptionsForUser(userId);

    successResponse(res, prescriptions);
  } catch (error) {
    console.error("Get prescriptions error:", error);

    errorResponse(res, "Failed to retrieve prescriptions", 500);
  }
}

/**
 * Get one prescription by ID.
 *
 * Admins can retrieve any prescription.
 * Regular customers can only retrieve their own prescription.
 */
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

    const userId = request.user?.userId;
    const role = request.user?.role;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const prescription =
      role === "ADMIN"
        ? await getPrescriptionById(id)
        : await getPrescriptionForUser(userId, id);

    if (!prescription) {
      errorResponse(res, "Prescription not found", 404);
      return;
    }

    successResponse(res, prescription);
  } catch (error) {
    console.error("Get single prescription error:", error);

    errorResponse(res, "Failed to retrieve prescription", 500);
  }
}

/**
 * Get the currently authenticated customer's prescriptions.
 */
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

    successResponse(res, prescriptions);
  } catch (error) {
    console.error("Get my prescriptions error:", error);

    errorResponse(res, "Failed to retrieve prescriptions", 500);
  }
}

/**
 * Get one prescription belonging to the currently authenticated customer.
 */
export async function getMyPrescription(
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

    successResponse(res, prescription);
  } catch (error) {
    console.error("Get my prescription error:", error);

    errorResponse(res, "Failed to retrieve prescription", 500);
  }
}

/**
 * Change prescription status.
 *
 * Only admins should be allowed to reach this controller.
 */
export async function changePrescriptionStatus(
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

    const { status } = req.body as {
      status?: PrescriptionStatus;
    };

    const validStatuses: PrescriptionStatus[] = [
      "PENDING",
      "REVIEWING",
      "APPROVED",
      "REJECTED",
      "FULFILLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      errorResponse(res, "Invalid prescription status", 400);
      return;
    }

    const prescription = await getPrescriptionById(id);

    if (!prescription) {
      errorResponse(res, "Prescription not found", 404);
      return;
    }

    const reviewerId = request.user?.userId;

    const updatedPrescription = await updatePrescriptionStatus(
      id,
      status,
      reviewerId,
    );

    successResponse(
      res,
      updatedPrescription,
      "Prescription status updated successfully",
    );
  } catch (error) {
    console.error("Change prescription status error:", error);

    errorResponse(res, "Failed to update prescription status", 500);
  }
}

/**
 * Securely retrieve a prescription file from private Supabase Storage.
 *
 * Admins can retrieve any prescription.
 * Customers can only retrieve their own prescription.
 */
export async function getPrescriptionFile(
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

    const userId = request.user?.userId;
    const role = request.user?.role;

    if (!userId || userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const prescription =
      role === "ADMIN"
        ? await getPrescriptionById(id)
        : await getPrescriptionForUser(userId, id);

    if (!prescription) {
      console.error("Prescription file lookup failed:", {
        prescriptionId: id,
        userId,
        role,
      });

      errorResponse(res, "Prescription not found", 404);
      return;
    }

    const storagePath = prescription.fileUrl?.trim();

    /*
     * TEMPORARY DIAGNOSTIC LOGGING
     *
     * This tells us exactly which Supabase Storage path the backend
     * is attempting to download.
     */
    console.log("PRESCRIPTION FILE DEBUG:", {
      prescriptionId: id,
      storagePath,
      role,
      userId,
    });

    if (!storagePath) {
      errorResponse(res, "Prescription file is unavailable", 404);
      return;
    }

    let fileBuffer: Buffer;

    try {
      fileBuffer = await downloadPrescriptionFile(storagePath);
    } catch (error) {
      console.error("Supabase prescription file download error:", error);

      errorResponse(res, "Prescription file is unavailable", 404);
      return;
    }

    const contentType = getContentType(storagePath);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileBuffer.length.toString());
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Get prescription file error:", error);

    errorResponse(res, "Failed to retrieve prescription file", 500);
  }
}

/**
 * Submit a new prescription.
 *
 * The uploaded file is stored in private Supabase Storage.
 * Only the storage path is saved in PostgreSQL.
 */
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

    const extension = getFileExtension(file);

    if (!extension) {
      errorResponse(res, "Unsupported prescription file type", 400);
      return;
    }

    const filename = `${randomUUID()}${extension}`;

    const storagePath = `prescriptions/${userId}/${filename}`;

    console.log("PRESCRIPTION UPLOAD DEBUG:", {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      storagePath,
    });

    await uploadPrescriptionFile(storagePath, file.buffer, file.mimetype);

    console.log("PRESCRIPTION UPLOAD SUCCESS:", {
      storagePath,
    });

    try {
      const prescription = await createPrescription(userId, {
        fileUrl: storagePath,
        ...(notes ? { notes } : {}),
      });

      console.log("PRESCRIPTION DATABASE RECORD CREATED:", {
        prescriptionId: prescription.id,
        fileUrl: prescription.fileUrl,
      });

      successResponse(
        res,
        prescription,
        "Prescription submitted successfully",
        201,
      );
    } catch (databaseError) {
      console.error("Create prescription database error:", databaseError);

      try {
        await deletePrescriptionFile(storagePath);
      } catch (cleanupError) {
        console.error("Prescription upload cleanup error:", cleanupError);
      }

      throw databaseError;
    }
  } catch (error) {
    console.error("Submit prescription error:", error);

    errorResponse(res, "Failed to submit prescription", 500);
  }
}

/**
 * Determine the correct extension for supported prescription files.
 */
function getFileExtension(file: Express.Multer.File): string {
  switch (file.mimetype) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "application/pdf":
      return ".pdf";

    default:
      return "";
  }
}

/**
 * Determine the response Content-Type from the stored file path.
 */
function getContentType(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";

    case ".png":
      return "image/png";

    case ".pdf":
      return "application/pdf";

    default:
      return "application/octet-stream";
  }
}
