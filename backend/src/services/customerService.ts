import prisma from "../config/database.js";

export async function getAllCustomers() {
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      createdAt: true,
      orders: {
        select: {
          total: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return customers.map((customer) => {
    const orders = customer.orders.length;

    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      orders,
      totalSpent,
      status: customer.active ? "Active" : "Inactive",
      joined: customer.createdAt,
      location: "Uyo, Akwa Ibom",
    };
  });
}

export async function getCustomerById(customerId: string) {
  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
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
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const totalSpent = customer.orders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
    orders: customer.orders.length,
    totalSpent,
    status: customer.active ? "Active" : "Inactive",
    joined: customer.createdAt,
    location: "Uyo, Akwa Ibom",
    orderHistory: customer.orders,
  };
}

export async function updateCustomerStatus(
  customerId: string,
  active: boolean,
) {
  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      role: "CUSTOMER",
    },
  });

  if (!customer) {
    return null;
  }

  const updatedCustomer = await prisma.user.update({
    where: {
      id: customerId,
    },
    data: {
      active,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      createdAt: true,
    },
  });

  return {
    ...updatedCustomer,
    phone: updatedCustomer.phone ?? "",
    status: updatedCustomer.active ? "Active" : "Inactive",
    joined: updatedCustomer.createdAt,
  };
}
