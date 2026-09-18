import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

const PORT = env.PORT;
const HOST = "0.0.0.0";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, "");

const configuredFrontendOrigin = normalizeOrigin(env.FRONTEND_URL);

const allowedOrigins = new Set([
  configuredFrontendOrigin,
  "https://pharma-blaze.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

/*
 * ============================================================
 * SECURITY HEADERS
 * ============================================================
 */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

/*
 * ============================================================
 * CORS
 * ============================================================
 */

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Allow requests that do not contain an Origin header,
       * such as server-to-server requests or certain tools.
       */
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

/*
 * ============================================================
 * REQUEST BODY
 * ============================================================
 */

app.use(
  express.json({
    limit: "2mb",
  }),
);

/*
 * ============================================================
 * API RATE LIMITING
 * ============================================================
 *
 * Authentication routes also have their own stricter
 * rate limiters.
 */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/*
 * ============================================================
 * HEALTH CHECK
 * ============================================================
 */

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Pharmablaze API is running",
    timestamp: new Date().toISOString(),
  });
});

/*
 * ============================================================
 * API ROUTES
 * ============================================================
 */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/wishlist", wishlistRoutes);

/*
 * ============================================================
 * 404 HANDLER
 * ============================================================
 */

app.use(notFoundMiddleware);

/*
 * ============================================================
 * GLOBAL ERROR HANDLER
 * ============================================================
 */

app.use(errorMiddleware);

/*
 * ============================================================
 * START SERVER
 * ============================================================
 */

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("🔥 PHARMABLAZE API");
  console.log(`🚀 Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Frontend: ${configuredFrontendOrigin}`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
  console.log("💊 Prescriptions: /api/prescriptions");
  console.log("❤️ Wishlist: /api/wishlist");
  console.log("⚙️ Settings: /api/admin/settings");
  console.log("");

  console.log(
    "🔐 Prescription files are served through authenticated API access.",
  );

  console.log("");
});
