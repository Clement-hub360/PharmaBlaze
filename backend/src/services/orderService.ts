import prisma from "../config/database.js";

import type {
  DeliveryMethod as PrismaDeliveryMethod,
  OrderStatus as PrismaOrderStatus,
} from "@prisma/client";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type DeliveryMethod = "DELIVERY" | "PICKUP";

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  items: CreateOrderItemInput[];
  paymentMethod?: "PAY_ON_CONFIRMATION" | "ONLINE";
  notes?: string;
};

const DELIVERY_FEE = 1500;

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

const VALID_PAYMENT_METHODS = ["PAY_ON_CONFIRMATION", "ONLINE"] as const;

function isValidDeliveryMethod(value: string): value is DeliveryMethod {
  return value === "DELIVERY" || value === "PICKUP";
}

function isValidPaymentMethod(
  value: string,
): value is "PAY_ON_CONFIRMATION" | "ONLINE" {
  return VALID_PAYMENT_METHODS.includes(
    value as (typeof VALID_PAYMENT_METHODS)[number],
  );
}

function isValidOrderStatus(value: string): value is OrderStatus {
  return VALID_ORDER_STATUSES.includes(value as OrderStatus);
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  if (!userId || userId.trim() === "") {
    throw new Error("Authentication required");
  }

  const customerName = input.customerName?.trim();

  const customerEmail = input.customerEmail?.trim().toLowerCase();

  const customerPhone = input.customerPhone?.trim();

  if (!customerName) {
    throw new Error("Customer name is required");
  }

  if (!customerEmail) {
    throw new Error("Customer email is required");
  }

  if (!customerPhone) {
    throw new Error("Customer phone is required");
  }

  if (!isValidDeliveryMethod(input.deliveryMethod)) {
    throw new Error("Invalid delivery method");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("At least one order item is required");
  }

  const paymentMethod = input.paymentMethod ?? "PAY_ON_CONFIRMATION";

  if (!isValidPaymentMethod(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  if (input.deliveryMethod === "DELIVERY" && !input.deliveryAddress?.trim()) {
    throw new Error("Delivery address is required for delivery orders");
  }

  const quantityByProductId = new Map<string, number>();

  for (const item of input.items) {
    if (typeof item.productId !== "string" || item.productId.trim() === "") {
      throw new Error("Every order item must have a valid product ID");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(
        "Every order item quantity must be a positive whole number",
      );
    }

    const productId = item.productId.trim();

    const currentQuantity = quantityByProductId.get(productId) ?? 0;

    quantityByProductId.set(productId, currentQuantity + item.quantity);
  }

  const normalizedItems = Array.from(quantityByProductId.entries()).map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    }),
  );

  return prisma.$transaction(
    async (tx) => {
      /*
       * Prices, names and stock are
       * always taken directly from
       * PostgreSQL.
       */

      const products = await tx.product.findMany({
        where: {
          id: {
            in: normalizedItems.map((item) => item.productId),
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          status: true,
          sku: true,
        },
      });

      if (products.length !== normalizedItems.length) {
        const foundIds = new Set(products.map((product) => product.id));

        const missingProduct = normalizedItems.find(
          (item) => !foundIds.has(item.productId),
        );

        throw new Error(
          `Product not found: ${missingProduct?.productId ?? "unknown"}`,
        );
      }

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      /*
       * Check product status and
       * available stock.
       */

      for (const item of normalizedItems) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.status !== "ACTIVE") {
          throw new Error(`${product.name} is currently unavailable`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          );
        }
      }

      /*
       * Calculate subtotal using
       * database prices.
       */

      let subtotal = 0;

      const orderItems = normalizedItems.map((item) => {
        const product = productMap.get(item.productId)!;

        const price = Number(product.price);

        subtotal += price * item.quantity;

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      });

      /*
       * Delivery fee is controlled
       * by the backend.
       */

      const deliveryFee =
        input.deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0;

      const total = subtotal + deliveryFee;

      /*
       * Prepare delivery address
       * as either a real string
       * or null.
       *
       * This avoids the
       * exactOptionalPropertyTypes
       * TypeScript error.
       */

      const deliveryAddress =
        input.deliveryMethod === "DELIVERY"
          ? input.deliveryAddress!.trim()
          : null;

      /*
       * Online payment is stored as
       * selected, but actual payment
       * processing will be connected
       * separately.
       */

      const order = await tx.order.create({
        data: {
          userId,
          customerName,
          customerEmail,
          customerPhone,

          deliveryMethod: input.deliveryMethod as PrismaDeliveryMethod,

          deliveryAddress,

          subtotal,
          deliveryFee,
          total,

          status: "PENDING" as PrismaOrderStatus,

          paymentMethod,

          paymentStatus: "PENDING",

          ...(input.notes !== undefined
            ? {
                notes: input.notes.trim() || null,
              }
            : {}),

          items: {
            create: orderItems,
          },
        },

        include: {
          items: true,
        },
      });

      /*
       * Reduce inventory inside the
       * same database transaction.
       */

      for (const item of normalizedItems) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,

            status: "ACTIVE",

            stock: {
              gte: item.quantity,
            },
          },

          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (result.count !== 1) {
          throw new Error(
            "Stock changed while the order was being processed. Please try again.",
          );
        }
      }

      /*
       * Return the completed order.
       */

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },

        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  sku: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    },

    {
      isolationLevel: "Serializable",
    },
  );
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: {
      userId,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              image: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              image: true,
            },
          },
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              image: true,
            },
          },
        },
      },

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

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!isValidOrderStatus(status)) {
    throw new Error("Invalid order status");
  }

  return prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status: status as PrismaOrderStatus,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

export { DELIVERY_FEE };
