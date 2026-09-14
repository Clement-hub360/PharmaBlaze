import {
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  Heart,
  ArrowRight,
  Package,
  Pill,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  type Product as ApiProduct,
} from "../services/productService";

type ShopProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  stock: number;
  slug: string;
};

const categories = [
  {
    name: "All Products",
    icon: Package,
  },
  {
    name: "Medicines",
    icon: Pill,
  },
  {
    name: "Wellness",
    icon: Heart,
  },
  {
    name: "Vitamins",
    icon: Sparkles,
  },
  {
    name: "Personal Care",
    icon: Heart,
  },
  {
    name: "Medical Devices",
    icon: Stethoscope,
  },
];

function getDisplayCategory(product: ApiProduct) {
  const categoryName = product.category?.name ?? "";

  if (categoryName === "Pharmacy Products") {
    return "Medicines";
  }

  return categoryName || "Pharmacy Products";
}

function getProductBadge(product: ApiProduct) {
  if (product.stock <= 0) {
    return "Out of Stock";
  }

  if (product.featured) {
    return "Featured";
  }

  if (product.stock <= 5) {
    return "Low Stock";
  }

  return "Available";
}

function transformProduct(product: ApiProduct): ShopProduct {
  return {
    id: product.id,
    name: product.name,
    category: getDisplayCategory(product),
    price: Number(product.price),
    rating: Number(product.rating ?? 0),
    reviews: 0,
    image: product.image ?? "/images/product-1.jpg",
    badge: getProductBadge(product),
    stock: product.stock,
    slug: product.slug,
  };
}

function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const apiProducts = await getProducts();

        if (mounted) {
          setProducts(apiProducts.map(transformProduct));
        }
      } catch (err) {
        console.error("Failed to load products:", err);

        if (mounted) {
          setError(
            "We could not load the products right now. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All Products" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          SHOP HERO
          ===================================================== */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* HERO TEXT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2.5 text-sm font-bold text-emerald-300">
                <ShoppingCart className="h-4 w-4" />
                Pharmablaze Online Shop
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                Shop pharmacy &
                <span className="block text-emerald-400">
                  wellness products.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                Explore our product categories and discover pharmacy, wellness,
                vitamins, personal care, and medical device products.
              </p>

              {/* SEARCH */}
              <div className="mt-9 max-w-2xl">
                <div className="flex items-center rounded-2xl bg-white p-2 shadow-2xl">
                  <Search className="ml-4 h-5 w-5 shrink-0 text-slate-400" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-transparent px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    type="button"
                    className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-600"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div>
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div
                  className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-900 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/images/pharmablaze-shop.jpg')",
                  }}
                >
                  <div className="absolute inset-0 bg-slate-950/35" />

                  <div className="relative z-10 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-3 shadow-2xl">
                      <img
                        src="/images/pharmablaze-logo-transparent.png"
                        alt="Pharmablaze Pharmacy"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
                      Pharmablaze Pharmacy
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      Your Health. Our Priority.
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Uyo, Akwa Ibom
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY NAVIGATION
          ===================================================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto py-5">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
          ===================================================== */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* HEADER */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                Our Products
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                Browse our collection
              </h2>

              <p className="mt-3 text-slate-600">
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} products displayed`}
              </p>
            </div>

            {/* FILTER BUTTON */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Product Category</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a category to narrow your results.
                  </p>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-red-300" />

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                Products unavailable
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-slate-600">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-64 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRODUCT GRID */}
          {!loading && !error && filteredProducts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const outOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* IMAGE */}
                    <Link
                      to={`/products/${product.slug}`}
                      className="relative block overflow-hidden bg-slate-100"
                    >
                      <div
                        className="flex h-64 items-center justify-center bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url('${product.image}')`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-2xl bg-white/90 px-5 py-4 text-center shadow-lg">
                            <Package className="mx-auto h-7 w-7 text-emerald-500" />

                            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                              Product Image
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BADGE */}
                      {product.badge && (
                        <span
                          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md ${
                            outOfStock
                              ? "bg-red-500"
                              : product.badge === "Low Stock"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}

                      {/* WISHLIST */}
                      <button
                        type="button"
                        onClick={(event) => event.preventDefault()}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md transition hover:text-red-500"
                        aria-label={`Add ${product.name} to wishlist`}
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </Link>

                    {/* CONTENT */}
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        {product.category}
                      </p>

                      <Link to={`/products/${product.id}`}>
                        <h3 className="mt-2 min-h-[56px] text-lg font-bold text-slate-950 transition hover:text-emerald-600">
                          {product.name}
                        </h3>
                      </Link>

                      {/* RATING */}
                      <div className="mt-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const filled = index < Math.round(product.rating);

                          return (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                filled
                                  ? "fill-current text-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          );
                        })}

                        <span className="ml-1 text-xs text-slate-500">
                          {product.rating > 0
                            ? product.rating.toFixed(1)
                            : "No rating"}
                        </span>
                      </div>

                      {/* PRICE */}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xl font-black text-slate-950">
                            {product.price > 0
                              ? `₦${product.price.toLocaleString()}`
                              : "Price TBA"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {outOfStock
                              ? "Currently unavailable"
                              : `${product.stock} in stock`}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={outOfStock}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-white transition ${
                            outOfStock
                              ? "cursor-not-allowed bg-slate-300"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          }`}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* EMPTY STATE */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                No products found
              </h3>

              <p className="mt-3 text-slate-500">
                Try another search term or product category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Products");
                }}
                className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SHOP INFORMATION
          ===================================================== */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Pharmacy Products
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Browse products through our organized pharmacy and wellness
                categories.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Online Shopping
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                The shop is designed to make discovering pharmacy products
                simple and convenient.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Need Assistance?
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Contact Pharmablaze if you have questions about a product or
                pharmacy-related enquiry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-24">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
            <img
              src="/images/pharmablaze-logo-transparent.png"
              alt="Pharmablaze Pharmacy"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
            Pharmablaze Pharmacy
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Can't find what
            <span className="block text-emerald-400">you're looking for?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Get in touch with Pharmablaze Pharmacy in Uyo for assistance with
            your pharmacy-related enquiry.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 font-bold text-white transition hover:bg-emerald-600"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Products;
