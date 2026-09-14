import { Router } from "express";

import { register, login } from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

import { successResponse } from "../utils/apiResponse.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
  return successResponse(
    res,
    req.user,
    "Authenticated user retrieved successfully",
  );
});

export default router;
