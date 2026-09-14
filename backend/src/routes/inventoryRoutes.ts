import { Router } from "express";
import {
  getInventoryController,
  updateInventoryStock,
} from "../controllers/inventoryController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getInventoryController);

router.patch("/:id/stock", updateInventoryStock);

export default router;
