import api from "./api";

export type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sku: string;
  price: number | string;
  stock: number;
  reorderLevel: number;
  image?: string | null;
  rating?: number | string | null;
  featured: boolean;
  status: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    active: boolean;
  } | null;
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
};

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await api.get("/wishlist");

  return response.data.data as WishlistItem[];
}

export async function addToWishlist(productId: string): Promise<WishlistItem> {
  const response = await api.post("/wishlist/items", {
    productId,
  });

  return response.data.data as WishlistItem;
}

export async function removeFromWishlist(
  productId: string,
): Promise<WishlistItem> {
  const response = await api.delete(`/wishlist/items/${productId}`);

  return response.data.data as WishlistItem;
}

export async function isProductInWishlist(productId: string): Promise<boolean> {
  const response = await api.get(`/wishlist/check/${productId}`);

  return Boolean(response.data.data?.inWishlist);
}

export async function clearWishlist(): Promise<void> {
  await api.delete("/wishlist");
}
