import type { Request, Response } from "express";
import { z } from "zod";

import { registerUser, loginUser } from "../services/authService.js";

import { successResponse, errorResponse } from "../utils/apiResponse.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z.string().trim().email("Please provide a valid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export async function register(req: Request, res: Response) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return errorResponse(
      res,
      "Invalid registration information",
      400,
      validation.error.flatten().fieldErrors,
    );
  }

  try {
    const user = await registerUser(validation.data);

    return successResponse(res, user, "Account created successfully", 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account";

    return errorResponse(res, message, 409);
  }
}

export async function login(req: Request, res: Response) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return errorResponse(
      res,
      "Invalid login information",
      400,
      validation.error.flatten().fieldErrors,
    );
  }

  try {
    const result = await loginUser(validation.data);

    return successResponse(res, result, "Login successful");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to login";

    return errorResponse(res, message, 401);
  }
}
