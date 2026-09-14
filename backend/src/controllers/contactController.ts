import type { Request, Response } from "express";
import {
  createContactMessage,
  deleteContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
} from "../services/contactService.js";
import type { MessageStatus } from "../services/contactService.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function createMessage(req: Request, res: Response) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || typeof name !== "string") {
      return errorResponse(res, "Name is required", 400);
    }

    if (!email || typeof email !== "string") {
      return errorResponse(res, "Email is required", 400);
    }

    if (!message || typeof message !== "string") {
      return errorResponse(res, "Message is required", 400);
    }

    const contactMessage = await createContactMessage({
      name,
      email,
      ...(phone !== undefined ? { phone } : {}),
      ...(subject !== undefined ? { subject } : {}),
      message,
    });

    return successResponse(
      res,
      contactMessage,
      "Message sent successfully",
      201,
    );
  } catch (error) {
    console.error("Create contact message error:", error);

    return errorResponse(res, "Failed to send message", 500);
  }
}

export async function getMessages(_req: Request, res: Response) {
  try {
    const messages = await getAllContactMessages();

    return successResponse(res, messages, "Messages retrieved successfully");
  } catch (error) {
    console.error("Get contact messages error:", error);

    return errorResponse(res, "Failed to retrieve messages", 500);
  }
}

export async function getMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return errorResponse(res, "Message ID is required", 400);
    }

    const message = await getContactMessageById(id);

    if (!message) {
      return errorResponse(res, "Message not found", 404);
    }

    return successResponse(res, message, "Message retrieved successfully");
  } catch (error) {
    console.error("Get contact message error:", error);

    return errorResponse(res, "Failed to retrieve message", 500);
  }
}

export async function changeMessageStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body as {
      status?: MessageStatus;
    };

    if (typeof id !== "string") {
      return errorResponse(res, "Message ID is required", 400);
    }

    const validStatuses: MessageStatus[] = [
      "NEW",
      "READ",
      "REPLIED",
      "ARCHIVED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, "Invalid message status", 400);
    }

    const updatedMessage = await updateContactMessageStatus(id, status);

    return successResponse(
      res,
      updatedMessage,
      "Message status updated successfully",
    );
  } catch (error) {
    console.error("Update contact message status error:", error);

    return errorResponse(res, "Failed to update message status", 500);
  }
}

export async function removeMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return errorResponse(res, "Message ID is required", 400);
    }

    await deleteContactMessage(id);

    return successResponse(res, null, "Message deleted successfully");
  } catch (error) {
    console.error("Delete contact message error:", error);

    return errorResponse(res, "Failed to delete message", 500);
  }
}
