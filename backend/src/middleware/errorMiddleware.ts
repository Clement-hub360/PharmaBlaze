import type { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => { 
  console.error("❌ API Error:", error);

  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : 500;

  const message =
    error instanceof Error ? error.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development"
      ? {
          error: error instanceof Error ? error.stack : error,
        }
      : {}),
  });
};

export default errorMiddleware;
