import type { Request, Response } from "express";

function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}

export default notFoundMiddleware;
