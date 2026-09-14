import prisma from "../config/database.js";

import type { PrescriptionStatus } from "@prisma/client";

export async function getAllPrescriptions() {
  return prisma.prescription.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export async function getPrescriptionById(id: string) {
  return prisma.prescription.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export async function updatePrescriptionStatus(
  id: string,
  status: PrescriptionStatus,
  reviewerId?: string,
) {
  const reviewStatuses: PrescriptionStatus[] = [
    "REVIEWING",
    "APPROVED",
    "REJECTED",
    "FULFILLED",
  ];

  return prisma.prescription.update({
    where: {
      id,
    },
    data: {
      status,

      ...(reviewStatuses.includes(status)
        ? {
            reviewedAt: new Date(),

            ...(reviewerId
              ? {
                  reviewedBy: reviewerId,
                }
              : {}),
          }
        : {
            reviewedAt: null,
            reviewedBy: null,
          }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export async function getPrescriptionsForUser(userId: string) {
  if (!userId || userId.trim() === "") {
    throw new Error("Authentication required");
  }

  return prisma.prescription.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPrescriptionForUser(
  userId: string,
  prescriptionId: string,
) {
  if (!userId || userId.trim() === "") {
    throw new Error("Authentication required");
  }

  if (!prescriptionId || prescriptionId.trim() === "") {
    throw new Error("Prescription ID is required");
  }

  return prisma.prescription.findFirst({
    where: {
      id: prescriptionId,
      userId,
    },
  });
}

export type CreatePrescriptionInput = {
  fileUrl: string;
  notes?: string;
};

export async function createPrescription(
  userId: string,
  input: CreatePrescriptionInput,
) {
  if (!userId || userId.trim() === "") {
    throw new Error("Authentication required");
  }

  const fileUrl = input.fileUrl?.trim();

  if (!fileUrl) {
    throw new Error("Prescription file is required");
  }

  const notes = input.notes !== undefined ? input.notes.trim() : null;

  return prisma.prescription.create({
    data: {
      userId,
      fileUrl,
      notes: notes || null,
      status: "PENDING",
    },
  });
}
