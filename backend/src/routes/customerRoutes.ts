import { Router } from "express";

import {
  changeCustomerStatus,
  getCustomers,
  getSingleCustomer,
} from "../controllers/customerController.js";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getCustomers);

router.get("/:id", getSingleCustomer);

router.patch("/:id/status", changeCustomerStatus);

export default router;
