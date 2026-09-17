import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { errorResponse } from "../utils/apiResponse.js";

type JwtPayload = {
userId: string;
email: string;
role: "CUSTOMER" | "ADMIN";
};

function isJwtPayload(value: unknown): value is JwtPayload {
if (!value || typeof value !== "object") {
return false;
}

const payload = value as Record<string, unknown>;

return (
typeof payload.userId === "string" &&
payload.userId.trim().length > 0 &&
typeof payload.email === "string" &&
payload.email.trim().length > 0 &&
(payload.role === "CUSTOMER" || payload.role === "ADMIN")
);
}

export function authenticate(
req: Request,
res: Response,
next: NextFunction,
) {
const authorization = req.headers.authorization;

if (!authorization) {
return errorResponse(res, "Authentication token is required", 401);
}

const parts = authorization.trim().split(/\s+/);

if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
return errorResponse(
res,
"Invalid authorization format. Use Bearer token",
401,
);
}

const token = parts[1];

try {
const decoded = jwt.verify(token, env.JWT_SECRET);

if (!isJwtPayload(decoded)) {
  return errorResponse(res, "Invalid authentication token", 401);
}

req.user = decoded;

return next();

} catch {
return errorResponse(
res,
"Invalid or expired authentication token",
401,
);
}
}

export function requireAdmin(
req: Request,
res: Response,
next: NextFunction,
) {
if (!req.user) {
return errorResponse(res, "Authentication required", 401);
}

if (req.user.role !== "ADMIN") {
return errorResponse(res, "Admin access required", 403);
}

return next();
}


