import prisma from "../config/database.js";

export type ContactMessageInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export async function createContactMessage(input: ContactMessageInput) {
  return prisma.contactMessage.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
      ...(input.subject !== undefined ? { subject: input.subject.trim() } : {}),
      message: input.message.trim(),
    },
  });
}

export async function getAllContactMessages() {
  return prisma.contactMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getContactMessageById(id: string) {
  return prisma.contactMessage.findUnique({
    where: {
      id,
    },
  });
}

export async function updateContactMessageStatus(
  id: string,
  status: MessageStatus,
) {
  return prisma.contactMessage.update({
    where: {
      id,
    },
    data: {
      status,
      ...(status === "REPLIED" ? { repliedAt: new Date() } : {}),
    },
  });
}

export async function deleteContactMessage(id: string) {
  return prisma.contactMessage.delete({
    where: {
      id,
    },
  });
}
