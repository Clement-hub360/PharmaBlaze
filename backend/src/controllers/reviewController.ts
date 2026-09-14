import type { Request, Response } from "express";

import {
  createReview,
  deleteReview,
  getAllReviews,
  getApprovedReviews,
  getReviewById,
  updateReviewStatus,
} from "../services/reviewService.js";

export async function createNewReview(req: Request, res: Response) {
  try {
    const { rating, comment } = req.body;

    const userId = req.user?.userId;

    if (!userId || typeof rating !== "number" || !comment) {
      return res.status(400).json({
        success: false,
        message: "userId, rating, and comment are required",
      });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const review = await createReview({
      userId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
}

export async function getPublicReviews(_req: Request, res: Response) {
  try {
    const reviews = await getApprovedReviews();

    return res.json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get approved reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
    });
  }
}

export async function getAdminReviews(_req: Request, res: Response) {
  try {
    const reviews = await getAllReviews();

    return res.json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
    });
  }
}

export async function getSingleReview(req: Request, res: Response) {
  try {
    const reviewId = req.params.id;

    if (typeof reviewId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.json({
      success: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve review",
    });
  }
}

export async function changeReviewStatus(req: Request, res: Response) {
  try {
    const reviewId = req.params.id;

    if (typeof reviewId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const { status } = req.body;

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be PENDING, APPROVED, or REJECTED",
      });
    }

    const review = await updateReviewStatus(reviewId, status);

    return res.json({
      success: true,
      message: "Review status updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review status",
    });
  }
}

export async function removeReview(req: Request, res: Response) {
  try {
    const reviewId = req.params.id;

    if (typeof reviewId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    await deleteReview(reviewId);

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
}
