import { Router } from "express";
import {
  changeMessageStatus,
  createMessage,
  getMessage,
  getMessages,
  removeMessage,
} from "../controllers/contactController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public contact form
router.post("/", createMessage);

// Admin message management
router.get("/", authenticate, requireAdmin, getMessages);

router.get("/:id", authenticate, requireAdmin, getMessage);

router.patch("/:id/status", authenticate, requireAdmin, changeMessageStatus);

router.delete("/:id", authenticate, requireAdmin, removeMessage);

export default router;
