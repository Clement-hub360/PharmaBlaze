import type { Response } from "express";

export function successResponse<T>(
  res: Response,
  data: T,
  message = "Request successful",
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message = "Something went wrong",
  statusCode = 500,
  errors?: unknown,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  });
}
