import { Router } from "express";
import multer from "multer";

import {
  changePrescriptionStatus,
  getPrescriptions,
  getSinglePrescription,
  getMyPrescriptions,
  getMyPrescription,
  submitPrescription,
} from "../controllers/prescriptionController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

/*
 * Prescription file upload configuration.
 *
 * Files are temporarily stored in memory.
 * The actual permanent storage layer will be added next.
 */
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(
        new Error("Only JPG, PNG, WEBP images and PDF files are allowed."),
      );
      return;
    }

    callback(null, true);
  },
});

/*
 * All prescription information requires authentication.
 */
router.use(authenticate);

/*
 * ============================================================
 * CUSTOMER
 * ============================================================
 */

/*
 * Submit a new prescription.
 *
 * POST /api/prescriptions
 *
 * multipart/form-data:
 * file
 * notes
 */
router.post("/", upload.single("file"), submitPrescription);

/*
 * Get prescriptions belonging to the logged-in customer.
 *
 * GET /api/prescriptions/my
 */
router.get("/my", getMyPrescriptions);

/*
 * Get one prescription belonging to the logged-in customer.
 *
 * GET /api/prescriptions/my/:id
 */
router.get("/my/:id", getMyPrescription);

/*
 * Get the prescription file.
 *
 * GET /api/prescriptions/:id/file
 *
 * This route will be added when the permanent
 * prescription file storage is connected.
 */

/*
 * ============================================================
 * ADMIN
 * ============================================================
 */

/*
 * Get all prescriptions.
 *
 * GET /api/prescriptions
 */
router.get("/", requireAdmin, getPrescriptions);

/*
 * Get one prescription.
 *
 * GET /api/prescriptions/:id
 */
router.get("/:id", requireAdmin, getSinglePrescription);

/*
 * Update prescription status.
 *
 * PATCH /api/prescriptions/:id/status
 */
router.patch("/:id/status", requireAdmin, changePrescriptionStatus);

export default router;
