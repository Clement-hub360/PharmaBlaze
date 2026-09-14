import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

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

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Allow requests that do not include
       * an Origin header, such as direct
       * server-to-server requests.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked origin: ${origin}`);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

/*
 * JSON body limit.
 *
 * Prescription uploads use multipart/form-data
 * and are therefore handled by Multer rather
 * than express.json().
 */
app.use(
  express.json({
    limit: "2mb",
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 100,

  standardHeaders: true,

  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Pharmablaze API is running",
    timestamp: new Date().toISOString(),
  });
});

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

app.use("/api/inventory", inventoryRoutes);

app.use("/api/prescriptions", prescriptionRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("❌ API Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

app.listen(PORT, () => {
  console.log("");

  console.log("🔥 PHARMABLAZE API");

  console.log(`🚀 Server: http://localhost:${PORT}`);

  console.log(`🌐 Frontend: ${FRONTEND_URL}`);

  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

  console.log(`💊 Prescriptions: http://localhost:${PORT}/api/prescriptions`);

  console.log(`❤️ Wishlist: http://localhost:${PORT}/api/wishlist`);

  console.log("");
});
