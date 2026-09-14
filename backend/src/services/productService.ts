import prisma from "../config/database.js";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  rating?: number;
  featured?: boolean;
  status?: ProductStatus;
  categoryId: string;
};

function validateProductInput(input: ProductInput) {
  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase();
  const description = input.description?.trim();
  const sku = input.sku?.trim().toUpperCase();
  const categoryId = input.categoryId?.trim();

  if (!name) {
    throw new Error("Product name is required");
  }

  if (!slug) {
    throw new Error("Product slug is required");
  }

  if (!description) {
    throw new Error("Product description is required");
  }

  if (!sku) {
    throw new Error("Product SKU is required");
  }

  if (!categoryId) {
    throw new Error("Product category is required");
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error(
      "Product price must be a valid number greater than or equal to zero",
    );
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new Error(
      "Product stock must be a whole number greater than or equal to zero",
    );
  }

  if (
    input.rating !== undefined &&
    (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5)
  ) {
    throw new Error("Product rating must be between 0 and 5");
  }

  if (
    input.status !== undefined &&
    !["ACTIVE", "INACTIVE", "OUT_OF_STOCK"].includes(input.status)
  ) {
    throw new Error("Invalid product status");
  }

  return {
    name,
    slug,
    description,
    sku,
    categoryId,
  };
}

function getSafeStatus(
  stock: number,
  requestedStatus?: ProductStatus,
): ProductStatus {
  if (requestedStatus === "INACTIVE") {
    return "INACTIVE";
  }

  if (stock === 0) {
    return "OUT_OF_STOCK";
  }

  return "ACTIVE";
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {
      featured: true,
      status: "ACTIVE",
      stock: {
        gt: 0,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
    },
  });
}

export async function createProduct(input: ProductInput) {
  const normalized = validateProductInput(input);

  const category = await prisma.category.findUnique({
    where: {
      id: normalized.categoryId,
    },
  });

  if (!category) {
    throw new Error("Selected product category does not exist");
  }

  const existingSku = await prisma.product.findUnique({
    where: {
      sku: normalized.sku,
    },
  });

  if (existingSku) {
    throw new Error(`A product with SKU "${normalized.sku}" already exists`);
  }

  const existingSlug = await prisma.product.findUnique({
    where: {
      slug: normalized.slug,
    },
  });

  if (existingSlug) {
    throw new Error(`A product with slug "${normalized.slug}" already exists`);
  }

  const status = getSafeStatus(input.stock, input.status);

  return prisma.product.create({
    data: {
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      sku: normalized.sku,
      price: input.price,
      stock: input.stock,
      image:
        input.image !== undefined && input.image.trim() !== ""
          ? input.image.trim()
          : null,
      rating: input.rating ?? 0,
      featured: input.featured ?? false,
      status,
      categoryId: normalized.categoryId,
    },
    include: {
      category: true,
    },
  });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const nextName =
    input.name !== undefined ? input.name.trim() : existingProduct.name;

  const nextSlug =
    input.slug !== undefined
      ? input.slug.trim().toLowerCase()
      : existingProduct.slug;

  const nextDescription =
    input.description !== undefined
      ? input.description.trim()
      : existingProduct.description;

  const nextSku =
    input.sku !== undefined
      ? input.sku.trim().toUpperCase()
      : existingProduct.sku;

  const nextCategoryId =
    input.categoryId !== undefined
      ? input.categoryId.trim()
      : existingProduct.categoryId;

  const nextPrice =
    input.price !== undefined ? input.price : Number(existingProduct.price);

  const nextStock =
    input.stock !== undefined ? input.stock : existingProduct.stock;

  const nextRating =
    input.rating !== undefined ? input.rating : Number(existingProduct.rating);

  if (!nextName) {
    throw new Error("Product name is required");
  }

  if (!nextSlug) {
    throw new Error("Product slug is required");
  }

  if (!nextDescription) {
    throw new Error("Product description is required");
  }

  if (!nextSku) {
    throw new Error("Product SKU is required");
  }

  if (!nextCategoryId) {
    throw new Error("Product category is required");
  }

  if (!Number.isFinite(nextPrice) || nextPrice < 0) {
    throw new Error(
      "Product price must be a valid number greater than or equal to zero",
    );
  }

  if (!Number.isInteger(nextStock) || nextStock < 0) {
    throw new Error(
      "Product stock must be a whole number greater than or equal to zero",
    );
  }

  if (!Number.isFinite(nextRating) || nextRating < 0 || nextRating > 5) {
    throw new Error("Product rating must be between 0 and 5");
  }

  const category = await prisma.category.findUnique({
    where: {
      id: nextCategoryId,
    },
  });

  if (!category) {
    throw new Error("Selected product category does not exist");
  }

  const duplicateSku = await prisma.product.findFirst({
    where: {
      sku: nextSku,
      NOT: {
        id,
      },
    },
  });

  if (duplicateSku) {
    throw new Error(`A product with SKU "${nextSku}" already exists`);
  }

  const duplicateSlug = await prisma.product.findFirst({
    where: {
      slug: nextSlug,
      NOT: {
        id,
      },
    },
  });

  if (duplicateSlug) {
    throw new Error(`A product with slug "${nextSlug}" already exists`);
  }

  const requestedStatus =
    input.status !== undefined ? input.status : existingProduct.status;

  const status = getSafeStatus(nextStock, requestedStatus);

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      name: nextName,
      slug: nextSlug,
      description: nextDescription,
      sku: nextSku,
      price: nextPrice,
      stock: nextStock,
      image:
        input.image !== undefined
          ? input.image.trim() || null
          : existingProduct.image,
      rating: nextRating,
      featured:
        input.featured !== undefined
          ? input.featured
          : existingProduct.featured,
      status,
      categoryId: nextCategoryId,
    },
    include: {
      category: true,
    },
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.product.delete({
    where: {
      id,
    },
  });
}
