import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
    email?: string;
    role?: string;
  };

  file?: Express.Multer.File;
};

function getFileExtension(file: Express.Multer.File): string {
  switch (file.mimetype) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "image/webp":
      return ".webp";

    default:
      return path.extname(file.originalname).toLowerCase() || "";
  }
}

export async function uploadBlogImage(
  req: Request,
  res: Response,
): Promise<void> {
  const request = req as AuthenticatedRequest;

  try {
    if (!request.user?.userId || request.user.userId.trim() === "") {
      errorResponse(res, "Authentication required", 401);

      return;
    }

    if (request.user.role !== "ADMIN") {
      errorResponse(res, "Administrator access required", 403);

      return;
    }

    const file = request.file;

    if (!file) {
      errorResponse(res, "Blog image file is required", 400);

      return;
    }

    const uploadDirectory = path.join(process.cwd(), "uploads", "blog");

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const extension = getFileExtension(file);

    if (!extension) {
      errorResponse(res, "Unsupported image format", 400);

      return;
    }

    const filename = `${randomUUID()}${extension}`;

    const filePath = path.join(uploadDirectory, filename);

    await writeFile(filePath, file.buffer);

    const fileUrl = `/uploads/blog/${filename}`;

    successResponse(
      res,
      {
        url: fileUrl,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      "Blog image uploaded successfully",
      201,
    );
  } catch (error) {
    console.error("Upload blog image error:", error);

    errorResponse(res, "Failed to upload blog image", 500);
  }
}
