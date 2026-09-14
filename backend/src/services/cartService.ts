import prisma from "../config/database.js";

export async function getCartByUserId(userId: string) {
  return prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function getOrCreateCart(userId: string) {
  const existingCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number,
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "ACTIVE") {
    throw new Error("This product is not currently available");
  }

  if (product.stock < 1) {
    throw new Error("This product is out of stock");
  }

  const cart = await prisma.cart.upsert({
    where: {
      userId,
    },
    create: {
      userId,
    },
    update: {},
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (newQuantity > product.stock) {
    throw new Error(
      `Only ${product.stock} item${product.stock === 1 ? "" : "s"} available in stock`,
    );
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getCartByUserId(userId);
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    include: {
      product: true,
    },
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  if (item.product.status !== "ACTIVE") {
    throw new Error("This product is no longer available");
  }

  if (quantity > item.product.stock) {
    throw new Error(
      `Only ${item.product.stock} item${item.product.stock === 1 ? "" : "s"} available in stock`,
    );
  }

  await prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,
    },
  });

  return getCartByUserId(userId);
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });

  return getCartByUserId(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    return null;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return getCartByUserId(userId);
}
