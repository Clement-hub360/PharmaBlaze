import api from "./api";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  rating?: number | null;
  featured: boolean;
  status: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function getProducts() {
  const response = await api.get("/products");

  return response.data.data as Product[];
}

export async function getProductBySlug(slug: string) {
  const response = await api.get(`/products/slug/${slug}`);

  return response.data.data as Product;
}
