import api from "./api";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReviewUser = {
  id: string;
  name: string;
  email?: string;
};

export type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
};

export type CreateReviewInput = {
  rating: number;
  comment: string;
};

/**
 * CUSTOMER
 * Submit a general pharmacy review.
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const response = await api.post("/reviews", input);

  return response.data.data as Review;
}

/**
 * PUBLIC
 * Get approved pharmacy reviews.
 */
export async function getApprovedReviews(): Promise<Review[]> {
  const response = await api.get("/reviews/approved");

  return response.data.data as Review[];
}

/**
 * ADMIN
 * Get all pharmacy reviews.
 */
export async function getAllReviews(): Promise<Review[]> {
  const response = await api.get("/reviews");

  return response.data.data as Review[];
}

/**
 * ADMIN
 * Get one review.
 */
export async function getReviewById(reviewId: string): Promise<Review> {
  const response = await api.get(`/reviews/${reviewId}`);

  return response.data.data as Review;
}

/**
 * ADMIN
 * Change review status.
 */
export async function updateReviewStatus(
  reviewId: string,
  status: ReviewStatus,
): Promise<Review> {
  const response = await api.patch(`/reviews/${reviewId}/status`, { status });

  return response.data.data as Review;
}

/**
 * ADMIN
 * Delete a review.
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}
