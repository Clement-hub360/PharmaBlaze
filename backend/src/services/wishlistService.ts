import prisma from "../config/database.js";

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    return existingItem;
  }

  return prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!existingItem) {
    throw new Error("Product is not in your wishlist");
  }

  return prisma.wishlistItem.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
}

export async function isProductInWishlist(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return Boolean(item);
}

export async function clearWishlist(userId: string) {
  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
    },
  });

  return {
    success: true,
  };
}
