import type { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Unhandled application error:", error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;
