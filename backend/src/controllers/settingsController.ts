import type { Request, Response } from "express";

import prisma from "../config/database.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

const defaultSettings = {
  pharmacyName: "Pharmablaze Pharmacy",
  phone: "0912 828 6533",
  email: null,
  address: "2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom",
  website: null,
  facebook: null,
  instagram: null,

  monday: "8:00 AM - 8:00 PM",
  tuesday: "8:00 AM - 8:00 PM",
  wednesday: "8:00 AM - 8:00 PM",
  thursday: "8:00 AM - 8:00 PM",
  friday: "8:00 AM - 8:00 PM",
  saturday: "9:00 AM - 6:00 PM",
  sunday: "Closed",

  storeEnabled: true,
  allowOrders: true,
  requireConfirmation: true,

  deliveryEnabled: true,
  deliveryFee: 1500,
  freeDeliveryMinimum: 50000,

  paymentOnConfirmation: true,
  onlinePayment: false,

  emailNotifications: true,
  orderNotifications: true,
  reviewNotifications: true,
  messageNotifications: true,

  twoFactorEnabled: false,
  sessionTimeout: 60,
};

function getString(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  return typeof body[key] === "string" ? body[key].trim() : undefined;
}

function getNullableString(
  body: Record<string, unknown>,
  key: string,
): string | null | undefined {
  if (typeof body[key] !== "string") {
    return undefined;
  }

  return body[key].trim() || null;
}

function getBoolean(
  body: Record<string, unknown>,
  key: string,
): boolean | undefined {
  return typeof body[key] === "boolean" ? body[key] : undefined;
}

function getNonNegativeNumber(
  body: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = body[key];

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return value;
}

function getSessionTimeout(body: Record<string, unknown>): number | undefined {
  const value = body.sessionTimeout;

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 5 ||
    value > 1440
  ) {
    return undefined;
  }

  return value;
}

export async function getAdminSettings(_req: Request, res: Response) {
  try {
    let settings = await prisma.pharmacySettings.findUnique({
      where: {
        id: "default",
      },
    });

    if (!settings) {
      settings = await prisma.pharmacySettings.create({
        data: defaultSettings,
      });
    }

    return successResponse(
      res,
      {
        ...settings,
        deliveryFee: Number(settings.deliveryFee),
        freeDeliveryMinimum: Number(settings.freeDeliveryMinimum),
      },
      "Pharmacy settings retrieved successfully",
    );
  } catch (error) {
    console.error("Get admin settings error:", error);

    return errorResponse(res, "Failed to retrieve pharmacy settings", 500);
  }
}

export async function updateAdminSettings(req: Request, res: Response) {
  try {
    const body = req.body as Record<string, unknown>;

    const existingSettings = await prisma.pharmacySettings.findUnique({
      where: {
        id: "default",
      },
    });

    const data: Record<string, unknown> = {};

    const pharmacyName = getString(body, "pharmacyName");
    if (pharmacyName !== undefined && pharmacyName.length > 0) {
      data.pharmacyName = pharmacyName;
    }

    const phone = getString(body, "phone");
    if (phone !== undefined) {
      data.phone = phone;
    }

    const email = getNullableString(body, "email");
    if (email !== undefined) {
      data.email = email;
    }

    const address = getString(body, "address");
    if (address !== undefined && address.length > 0) {
      data.address = address;
    }

    const website = getNullableString(body, "website");
    if (website !== undefined) {
      data.website = website;
    }

    const facebook = getNullableString(body, "facebook");
    if (facebook !== undefined) {
      data.facebook = facebook;
    }

    const instagram = getNullableString(body, "instagram");
    if (instagram !== undefined) {
      data.instagram = instagram;
    }

    const monday = getString(body, "monday");
    if (monday !== undefined) {
      data.monday = monday;
    }

    const tuesday = getString(body, "tuesday");
    if (tuesday !== undefined) {
      data.tuesday = tuesday;
    }

    const wednesday = getString(body, "wednesday");
    if (wednesday !== undefined) {
      data.wednesday = wednesday;
    }

    const thursday = getString(body, "thursday");
    if (thursday !== undefined) {
      data.thursday = thursday;
    }

    const friday = getString(body, "friday");
    if (friday !== undefined) {
      data.friday = friday;
    }

    const saturday = getString(body, "saturday");
    if (saturday !== undefined) {
      data.saturday = saturday;
    }

    const sunday = getString(body, "sunday");
    if (sunday !== undefined) {
      data.sunday = sunday;
    }

    const storeEnabled = getBoolean(body, "storeEnabled");
    if (storeEnabled !== undefined) {
      data.storeEnabled = storeEnabled;
    }

    const allowOrders = getBoolean(body, "allowOrders");
    if (allowOrders !== undefined) {
      data.allowOrders = allowOrders;
    }

    const requireConfirmation = getBoolean(body, "requireConfirmation");
    if (requireConfirmation !== undefined) {
      data.requireConfirmation = requireConfirmation;
    }

    const deliveryEnabled = getBoolean(body, "deliveryEnabled");
    if (deliveryEnabled !== undefined) {
      data.deliveryEnabled = deliveryEnabled;
    }

    const deliveryFee = getNonNegativeNumber(body, "deliveryFee");
    if (deliveryFee !== undefined) {
      data.deliveryFee = deliveryFee;
    }

    const freeDeliveryMinimum = getNonNegativeNumber(
      body,
      "freeDeliveryMinimum",
    );
    if (freeDeliveryMinimum !== undefined) {
      data.freeDeliveryMinimum = freeDeliveryMinimum;
    }

    const paymentOnConfirmation = getBoolean(body, "paymentOnConfirmation");
    if (paymentOnConfirmation !== undefined) {
      data.paymentOnConfirmation = paymentOnConfirmation;
    }

    const onlinePayment = getBoolean(body, "onlinePayment");
    if (onlinePayment !== undefined) {
      data.onlinePayment = onlinePayment;
    }

    const emailNotifications = getBoolean(body, "emailNotifications");
    if (emailNotifications !== undefined) {
      data.emailNotifications = emailNotifications;
    }

    const orderNotifications = getBoolean(body, "orderNotifications");
    if (orderNotifications !== undefined) {
      data.orderNotifications = orderNotifications;
    }

    const reviewNotifications = getBoolean(body, "reviewNotifications");
    if (reviewNotifications !== undefined) {
      data.reviewNotifications = reviewNotifications;
    }

    const messageNotifications = getBoolean(body, "messageNotifications");
    if (messageNotifications !== undefined) {
      data.messageNotifications = messageNotifications;
    }

    const twoFactorEnabled = getBoolean(body, "twoFactorEnabled");
    if (twoFactorEnabled !== undefined) {
      data.twoFactorEnabled = twoFactorEnabled;
    }

    const sessionTimeout = getSessionTimeout(body);
    if (sessionTimeout !== undefined) {
      data.sessionTimeout = sessionTimeout;
    }

    const settings = existingSettings
      ? await prisma.pharmacySettings.update({
          where: {
            id: "default",
          },
          data: data as never,
        })
      : await prisma.pharmacySettings.create({
          data: {
            ...defaultSettings,
            ...data,
          },
        });

    return successResponse(
      res,
      {
        ...settings,
        deliveryFee: Number(settings.deliveryFee),
        freeDeliveryMinimum: Number(settings.freeDeliveryMinimum),
      },
      "Pharmacy settings updated successfully",
    );
  } catch (error) {
    console.error("Update admin settings error:", error);

    return errorResponse(res, "Failed to update pharmacy settings", 500);
  }
}
