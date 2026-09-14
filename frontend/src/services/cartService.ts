import api from "./api";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  stock: number;
  image?: string | null;
  rating?: number | string | null;
  featured: boolean;
  status: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct;
};

export type Cart = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
};

export async function getCart(): Promise<Cart> {
  const response = await api.get("/cart");

  return response.data.data as Cart;
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
): Promise<Cart> {
  const response = await api.post("/cart/items", {
    productId,
    quantity,
  });

  return response.data.data as Cart;
}

export async function updateCartItem(
  productId: string,
  quantity: number,
): Promise<Cart> {
  const response = await api.patch(`/cart/items/${productId}`, {
    quantity,
  });

  return response.data.data as Cart;
}

export async function removeFromCart(productId: string): Promise<Cart> {
  const response = await api.delete(`/cart/items/${productId}`);

  return response.data.data as Cart;
}

export async function clearCart(): Promise<Cart | null> {
  const response = await api.delete("/cart");

  return response.data.data as Cart | null;
}
