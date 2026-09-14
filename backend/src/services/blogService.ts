import prisma from "../config/database.js";

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  published?: boolean;
};

export async function getAllBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: {
      id,
    },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: {
      slug,
    },
  });
}

export async function createBlogPost(input: BlogPostInput) {
  const published = input.published ?? false;

  return prisma.blogPost.create({
    data: {
      title: input.title.trim(),
      slug: input.slug.trim().toLowerCase(),
      excerpt: input.excerpt !== undefined ? input.excerpt.trim() : null,
      content: input.content.trim(),
      image: input.image !== undefined ? input.image.trim() : null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });
}

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>,
) {
  const existingPost = await prisma.blogPost.findUnique({
    where: {
      id,
    },
  });

  if (!existingPost) {
    return null;
  }

  const nextPublished =
    input.published !== undefined ? input.published : existingPost.published;

  let publishedAt = existingPost.publishedAt;

  if (nextPublished && !existingPost.published) {
    publishedAt = new Date();
  }

  if (!nextPublished) {
    publishedAt = null;
  }

  return prisma.blogPost.update({
    where: {
      id,
    },
    data: {
      ...(input.title !== undefined
        ? {
            title: input.title.trim(),
          }
        : {}),

      ...(input.slug !== undefined
        ? {
            slug: input.slug.trim().toLowerCase(),
          }
        : {}),

      ...(input.excerpt !== undefined
        ? {
            excerpt: input.excerpt.trim(),
          }
        : {}),

      ...(input.content !== undefined
        ? {
            content: input.content.trim(),
          }
        : {}),

      ...(input.image !== undefined
        ? {
            image: input.image.trim(),
          }
        : {}),

      published: nextPublished,
      publishedAt,
    },
  });
}

export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({
    where: {
      id,
    },
  });
}
