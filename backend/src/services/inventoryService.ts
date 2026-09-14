import prisma from "../config/database.js";

function getInventoryStatus(stock: number, reorderLevel: number) {
  if (stock === 0) {
    return "Out of Stock";
  }

  if (stock <= reorderLevel) {
    return "Low Stock";
  }

  return "In Stock";
}

export async function getInventory() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      reorderLevel: true,
      price: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const inventory = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category?.name ?? "Uncategorized",
    categoryId: product.category?.id ?? "",
    stock: product.stock,
    reorderLevel: product.reorderLevel,
    price: Number(product.price),
    status: getInventoryStatus(product.stock, product.reorderLevel),
    productStatus: product.status,
    lastUpdated: product.updatedAt,
    createdAt: product.createdAt,
  }));

  const totalProducts = inventory.length;

  const totalStockUnits = inventory.reduce(
    (sum, product) => sum + product.stock,
    0,
  );

  const inventoryValue = inventory.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );

  const lowStockItems = inventory.filter(
    (product) => product.stock > 0 && product.stock <= product.reorderLevel,
  ).length;

  const outOfStockItems = inventory.filter(
    (product) => product.stock === 0,
  ).length;

  return {
    items: inventory,
    summary: {
      totalProducts,
      totalStockUnits,
      inventoryValue,
      lowStockItems,
      outOfStockItems,
    },
  };
}

export async function updateStock(productId: string, quantityDelta: number) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return null;
  }

  const newStock = product.stock + quantityDelta;

  if (newStock < 0) {
    throw new Error(
      `Stock cannot be reduced below zero. Current stock: ${product.stock}`,
    );
  }

  /*
   * Keep manually disabled products disabled.
   *
   * If the product reaches zero stock, mark it OUT_OF_STOCK.
   * If an OUT_OF_STOCK product receives new stock, reactivate it.
   * If an INACTIVE product receives stock, keep it INACTIVE.
   */
  let newStatus = product.status;

  if (newStock === 0) {
    newStatus = "OUT_OF_STOCK";
  } else if (product.status === "OUT_OF_STOCK") {
    newStatus = "ACTIVE";
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      stock: newStock,
      status: newStatus,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      reorderLevel: true,
      price: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    ...updatedProduct,
    price: Number(updatedProduct.price),
    inventoryStatus: getInventoryStatus(
      updatedProduct.stock,
      updatedProduct.reorderLevel,
    ),
  };
}
