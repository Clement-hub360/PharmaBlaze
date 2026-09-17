import type { Request, Response } from "express";
import { z } from "zod";

import { registerUser, loginUser } from "../services/authService.js";

import { successResponse, errorResponse } from "../utils/apiResponse.js";

const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z.string().trim().email("Please provide a valid email address"),

  password: strongPasswordSchema,
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
    if (
      error instanceof Error &&
      error.message === "An account with this email already exists"
    ) {
      return errorResponse(res, error.message, 409);
    }

    console.error("Registration error:", error);

    return errorResponse(res, "Unable to create account", 500);
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
    console.warn(
      "Login attempt failed:",
      error instanceof Error ? error.message : "Unknown authentication error",
    );

    return errorResponse(res, "Invalid email or password", 401);
  }
}
