import type { Request, Response } from "express";

import {
  createBlogPost,
  deleteBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  getPublishedBlogPosts,
  updateBlogPost,
} from "../services/blogService.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getBlogPosts(req: Request, res: Response) {
  try {
    const posts = await getAllBlogPosts();

    return successResponse(res, posts, "Blog posts retrieved successfully");
  } catch (error) {
    console.error("Get blog posts error:", error);

    return errorResponse(res, "Failed to retrieve blog posts", 500);
  }
}

export async function getPublishedPosts(req: Request, res: Response) {
  try {
    const posts = await getPublishedBlogPosts();

    return successResponse(
      res,
      posts,
      "Published blog posts retrieved successfully",
    );
  } catch (error) {
    console.error("Get published blog posts error:", error);

    return errorResponse(res, "Failed to retrieve published blog posts", 500);
  }
}

export async function getSingleBlogPost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return errorResponse(res, "Blog post ID is required", 400);
    }

    const post = await getBlogPostById(id);

    if (!post) {
      return errorResponse(res, "Blog post not found", 404);
    }

    return successResponse(res, post, "Blog post retrieved successfully");
  } catch (error) {
    console.error("Get blog post error:", error);

    return errorResponse(res, "Failed to retrieve blog post", 500);
  }
}

export async function getBlogPostFromSlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string" || slug.trim() === "") {
      return errorResponse(res, "Blog post slug is required", 400);
    }

    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return errorResponse(res, "Blog post not found", 404);
    }

    return successResponse(res, post, "Blog post retrieved successfully");
  } catch (error) {
    console.error("Get blog post by slug error:", error);

    return errorResponse(res, "Failed to retrieve blog post", 500);
  }
}

export async function createNewBlogPost(req: Request, res: Response) {
  try {
    const { title, slug, excerpt, content, image, published } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
      return errorResponse(res, "Article title is required", 400);
    }

    if (typeof content !== "string" || content.trim() === "") {
      return errorResponse(res, "Article content is required", 400);
    }

    const finalSlug =
      typeof slug === "string" && slug.trim() !== ""
        ? createSlug(slug)
        : createSlug(title);

    if (!finalSlug) {
      return errorResponse(res, "A valid article slug is required", 400);
    }

    const existingPost = await getBlogPostBySlug(finalSlug);

    if (existingPost) {
      return errorResponse(
        res,
        "An article with this slug already exists",
        409,
      );
    }

    const post = await createBlogPost({
      title,
      slug: finalSlug,
      excerpt,
      content,
      image,
      published: typeof published === "boolean" ? published : false,
    });

    return successResponse(res, post, "Blog post created successfully", 201);
  } catch (error) {
    console.error("Create blog post error:", error);

    return errorResponse(res, "Failed to create blog post", 500);
  }
}

export async function updateExistingBlogPost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return errorResponse(res, "Blog post ID is required", 400);
    }

    const existingPost = await getBlogPostById(id);

    if (!existingPost) {
      return errorResponse(res, "Blog post not found", 404);
    }

    const { title, slug, excerpt, content, image, published } = req.body;

    const updateData: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      image?: string;
      published?: boolean;
    } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return errorResponse(res, "Article title cannot be empty", 400);
      }

      updateData.title = title;
    }

    if (slug !== undefined) {
      if (typeof slug !== "string" || slug.trim() === "") {
        return errorResponse(res, "Article slug cannot be empty", 400);
      }

      updateData.slug = createSlug(slug);
    }

    if (excerpt !== undefined) {
      if (typeof excerpt !== "string") {
        return errorResponse(res, "Article excerpt must be text", 400);
      }

      updateData.excerpt = excerpt;
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim() === "") {
        return errorResponse(res, "Article content cannot be empty", 400);
      }

      updateData.content = content;
    }

    if (image !== undefined) {
      if (typeof image !== "string") {
        return errorResponse(res, "Article image must be text", 400);
      }

      updateData.image = image;
    }

    if (published !== undefined) {
      if (typeof published !== "boolean") {
        return errorResponse(res, "Published value must be true or false", 400);
      }

      updateData.published = published;
    }

    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugOwner = await getBlogPostBySlug(updateData.slug);

      if (slugOwner && slugOwner.id !== id) {
        return errorResponse(
          res,
          "An article with this slug already exists",
          409,
        );
      }
    }

    const post = await updateBlogPost(id, updateData);

    if (!post) {
      return errorResponse(res, "Blog post not found", 404);
    }

    return successResponse(res, post, "Blog post updated successfully");
  } catch (error) {
    console.error("Update blog post error:", error);

    return errorResponse(res, "Failed to update blog post", 500);
  }
}

export async function removeBlogPost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return errorResponse(res, "Blog post ID is required", 400);
    }

    const existingPost = await getBlogPostById(id);

    if (!existingPost) {
      return errorResponse(res, "Blog post not found", 404);
    }

    await deleteBlogPost(id);

    return successResponse(res, null, "Blog post deleted successfully");
  } catch (error) {
    console.error("Delete blog post error:", error);

    return errorResponse(res, "Failed to delete blog post", 500);
  }
}
