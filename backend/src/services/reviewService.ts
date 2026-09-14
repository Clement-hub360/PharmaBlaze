import prisma from "../config/database.js";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReviewInput = {
  userId: string;
  rating: number;
  comment: string;
};

export async function createReview(input: ReviewInput) {
  return prisma.review.create({
    data: {
      userId: input.userId,
      rating: input.rating,
      comment: input.comment.trim(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getApprovedReviews() {
  return prisma.review.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllReviews() {
  return prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
  return prisma.review.update({
    where: { id },
    data: {
      status,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function deleteReview(id: string) {
  return prisma.review.delete({
    where: { id },
  });
}
