import type { Request, Response } from "express";
import prisma from "../config/database.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getAdminDashboard(req: Request, res: Response) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [
      orderSummary,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: {
            not: "CANCELLED",
          },
        },
        _sum: {
          total: true,
        },
      }),

      prisma.order.count(),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.product.count(),

      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          deliveryMethod: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
            },
          },
        },
      }),

      prisma.product.findMany({
        where: {
          OR: [
            {
              stock: {
                lte: 5,
              },
            },
            {
              status: "OUT_OF_STOCK",
            },
          ],
        },
        take: 8,
        orderBy: {
          stock: "asc",
        },
        select: {
          id: true,
          name: true,
          stock: true,
          status: true,
          price: true,
          image: true,
        },
      }),
    ]);

    const sales = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const salesByDay: Record<
      string,
      {
        date: string;
        sales: number;
        orders: number;
      }
    > = {};

    for (let i = 0; i < 30; i += 1) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);

      const key = date.toISOString().slice(0, 10);

      salesByDay[key] = {
        date: key,
        sales: 0,
        orders: 0,
      };
    }

    for (const order of sales) {
      const key = order.createdAt.toISOString().slice(0, 10);

      if (!salesByDay[key]) {
        salesByDay[key] = {
          date: key,
          sales: 0,
          orders: 0,
        };
      }

      salesByDay[key].sales += Number(order.total);
      salesByDay[key].orders += 1;
    }

    const dashboard = {
      stats: {
        totalSales: Number(orderSummary._sum.total ?? 0),
        totalOrders,
        totalCustomers,
        totalProducts,
      },

      salesOverview: Object.values(salesByDay),

      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: Number(order.total),
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: order.createdAt,
      })),

      stockAlerts: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        status: product.status,
        price: Number(product.price),
        image: product.image,
      })),

      systemStatus: {
        database: "Connected",
        authentication: "Connected",
        ordersApi: "Connected",
        inventory: "Connected",
      },
    };

    return successResponse(
      res,
      dashboard,
      "Admin dashboard retrieved successfully",
    );
  } catch (error) {
    console.error("Get admin dashboard error:", error);

    return errorResponse(res, "Failed to retrieve admin dashboard", 500);
  }
}
