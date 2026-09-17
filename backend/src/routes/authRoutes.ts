import { Router } from "express";
import rateLimit from "express-rate-limit";

import { register, login } from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

import { successResponse } from "../utils/apiResponse.js";

const router = Router();

/*
 * Authentication rate limiters
 *
 * Login is intentionally stricter because repeated
 * login attempts are a common brute-force target.
 *
 * Registration also receives a dedicated limit to
 * reduce automated account creation and abuse.
 */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

router.post("/register", registerLimiter, register);

router.post("/login", loginLimiter, login);

router.get("/me", authenticate, (req, res) => {
  return successResponse(
    res,
    req.user,
    "Authenticated user retrieved successfully",
  );
});

export default router;
