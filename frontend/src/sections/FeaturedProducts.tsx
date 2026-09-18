import { useEffect, useState } from "react";
import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

type ApiProduct = {
  id: string | number;
  name: string;
  price: number | string;
  image?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  reviews?: number | null;
  stock?: number | null;
  category?: {
    id?: string;
    name?: string;
  } | null;
};

type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
};

type ProductsResponse = {
  success?: boolean;
  data?: ApiProduct[];
  products?: ApiProduct[];
  message?: string;
};

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ProductsResponse>("/products");

        const apiProducts =
          response.data?.data ?? response.data?.products ?? [];

        if (!mounted) return;

        const featuredProducts = apiProducts
          .filter((product) => Number(product.stock ?? 0) > 0)
          .slice(0, 4)
          .map((product) => ({
            id: product.id,
            name: product.name,
            category: product.category?.name ?? "Pharmacy",
            price: Number(product.price),
            image: product.image ?? "",
            rating: Number(product.rating ?? 0),
            reviews: Number(product.reviewCount ?? product.reviews ?? 0),
            available: Number(product.stock ?? 0) > 0,
          }));

        setProducts(featuredProducts);
      } catch (err) {
        console.error("Failed to load featured products:", err);

        if (mounted) {
          setError("Unable to load products right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const getProductImage = (image: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${api.defaults.baseURL?.replace(/\/api$/, "")}${image}`;
    }

    return image;
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-700">
              Featured Products
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pharmacy Products for Your Everyday Needs
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Browse our product collection and discover convenient access to
              pharmacy, wellness, personal care, and healthcare products.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-green-700 transition hover:text-green-900"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-slate-200" />

                <div className="space-y-4 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="font-semibold text-red-700">{error}</p>

            <p className="mt-2 text-sm text-red-600">
              Please try again or visit the full product catalog.
            </p>

            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              View Products
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="font-semibold text-slate-800">
              No featured products are available right now.
            </p>

            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Browse Product Catalog
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl = getProductImage(product.image);

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
                >
                  {/* PRODUCT IMAGE */}
                  <Link
                    to={`/products/${product.id}`}
                    className="relative block aspect-square overflow-hidden bg-slate-100"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-green-50 to-slate-100 p-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-700 text-3xl font-bold text-white shadow-lg">
                          P
                        </div>

                        <p className="mt-4 text-sm font-medium text-slate-500">
                          Product image
                        </p>
                      </div>
                    )}

                    {/* AVAILABILITY BADGE */}
                    <div className="absolute left-4 top-4">
                      {product.available ? (
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      {product.category}
                    </p>

                    <Link to={`/products/${product.id}`}>
                      <h3 className="mt-2 line-clamp-2 min-h-[52px] text-lg font-bold text-slate-900 transition hover:text-green-700">
                        {product.name}
                      </h3>
                    </Link>

                    {/* RATING */}
                    <div className="mt-3 flex items-center gap-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={15}
                            className={
                              index < Math.round(product.rating)
                                ? "fill-current text-yellow-500"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>

                      <span className="text-xs text-slate-500">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="mt-4">
                      <span className="text-xl font-bold text-slate-900">
                        ₦{product.price.toLocaleString("en-NG")}
                      </span>
                    </div>

                    {/* ACTION */}
                    <Link
                      to={`/products/${product.id}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                      <ShoppingCart size={17} />
                      View Product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-green-700 px-6 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
          >
            Browse Full Product Catalog
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
