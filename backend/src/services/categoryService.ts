import prisma from "../config/database.js";

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active?: boolean;
};

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: {
      slug,
    },
    include: {
      products: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      ...(input.image !== undefined ? { image: input.image.trim() } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
) {
  return prisma.category.update({
    where: {
      id,
    },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.slug !== undefined
        ? { slug: input.slug.trim().toLowerCase() }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      ...(input.image !== undefined ? { image: input.image.trim() } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: {
      id,
    },
  });
}
