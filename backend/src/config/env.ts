import "dotenv/config";

const nodeEnv = process.env.NODE_ENV?.trim() || "development";

const isProduction = nodeEnv === "production";

const portValue = process.env.PORT?.trim();

const parsedPort = portValue ? Number(portValue) : 5000;

if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  throw new Error("PORT must be a valid number between 1 and 65535");
}

const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:5173";

const databaseUrl = process.env.DATABASE_URL?.trim();

const jwtSecret = process.env.JWT_SECRET?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be configured");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET must be configured");
}

if (isProduction && jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long in production",
  );
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parsedPort,
  FRONTEND_URL: frontendUrl,
  DATABASE_URL: databaseUrl,
  JWT_SECRET: jwtSecret,
} as const;
