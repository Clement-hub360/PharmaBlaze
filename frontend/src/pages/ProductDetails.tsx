import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getProductBySlug,
  getProducts,
  type Product as ApiProduct,
} from "../services/productService";
import { addToCart } from "../services/cartService";
import {
  addToWishlist,
  isProductInWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  available: boolean;
};

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setError("Product was not specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setCartMessage("");
        setWishlistMessage("");
        setWishlist(false);

        let apiProduct: ApiProduct | null = null;

        /*
         * The Products page can use either the database product ID
         * or the product slug in the URL.
         */
        const products = await getProducts();

        apiProduct = products.find((item) => item.id === id) ?? null;

        /*
         * If the URL contains a slug instead of an ID,
         * use the dedicated slug endpoint.
         */
        if (!apiProduct) {
          try {
            apiProduct = await getProductBySlug(id);
          } catch {
            apiProduct = null;
          }
        }

        if (!apiProduct) {
          if (!cancelled) {
            setProduct(null);
            setError("We couldn't find the product you're looking for.");
          }
          return;
        }

        const categoryName =
          apiProduct.category?.name === "Pharmacy Products"
            ? "Medicines"
            : (apiProduct.category?.name ?? "Pharmacy Products");

        const mappedProduct: Product = {
          id: apiProduct.id,
          name: apiProduct.name,
          slug: apiProduct.slug,
          category: categoryName,
          price: Number(apiProduct.price),
          description:
            apiProduct.description?.trim() ||
            "Product information is available from Pharmablaze Pharmacy. Please contact the pharmacy team if you need additional information about this product.",
          image: apiProduct.image?.trim() || "/images/product-placeholder.jpg",
          rating: Number(apiProduct.rating ?? 0),
          reviews: 0,
          stock: Number(apiProduct.stock ?? 0),
          available:
            apiProduct.status === "ACTIVE" &&
            Number(apiProduct.stock ?? 0) > 0,
        };

        if (!cancelled) {
          setProduct(mappedProduct);
          setQuantity(1);
        }

        /*
         * Check the real database wishlist status for this product.
         *
         * If the customer is not logged in, the backend may return 401.
         * That should not prevent the product page from loading.
         */
        try {
          const inWishlist = await isProductInWishlist(apiProduct.id);

          if (!cancelled) {
            setWishlist(inWishlist);
          }
        } catch (wishlistError: any) {
          if (wishlistError?.response?.status !== 401) {
            console.error(
              "Failed to check wishlist status:",
              wishlistError,
            );
          }

          if (!cancelled) {
            setWishlist(false);
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);

        if (!cancelled) {
          setProduct(null);
          setError(
            "We couldn't load this product right now. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function increaseQuantity() {
    if (!product) return;

    setQuantity((current) =>
      Math.min(current + 1, Math.max(1, product.stock)),
    );

    setCartMessage("");
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
    setCartMessage("");
  }

  async function handleWishlistToggle() {
    if (!product || wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistMessage("");
      setError("");

      if (wishlist) {
        await removeFromWishlist(product.id);

        setWishlist(false);
        setWishlistMessage("Product removed from your wishlist.");
      } else {
        await addToWishlist(product.id);

        setWishlist(true);
        setWishlistMessage("Product added to your wishlist.");
      }
    } catch (err: any) {
      console.error("Failed to update wishlist:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        setWishlistMessage(
          "Please log in to your account before managing your wishlist.",
        );
      } else if (typeof message === "string" && message.trim() !== "") {
        setWishlistMessage(message);
      } else {
        setWishlistMessage(
          "We couldn't update your wishlist. Please try again.",
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!product || !product.available || addingToCart) {
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage("");
      setError("");

      await addToCart(product.id, quantity);

      setCartMessage(
        `${quantity} ${
          quantity === 1 ? "item" : "items"
        } added to your cart successfully.`,
      );
    } catch (err: any) {
      console.error("Failed to add product to cart:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        setCartMessage(
          "Please log in to your account before adding products to your cart.",
        );
      } else if (typeof message === "string" && message.trim() !== "") {
        setCartMessage(message);
      } else {
        setCartMessage(
          "We couldn't add this product to your cart. Please try again.",
        );
      }
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-slate-100">
            <Package className="h-8 w-8 text-emerald-500" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-950">
            Loading Product
          </h1>

          <p className="mt-3 text-slate-600">
            Please wait while we retrieve the product information.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Package className="h-8 w-8 text-slate-400" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-950">
            Product not found
          </h1>

          <p className="mt-3 text-slate-600">
            {error || "We couldn't find the product you're looking for."}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-slate-500 transition hover:text-emerald-600"
            >
              Home
            </Link>

            <span className="text-slate-300">/</span>

            <Link
              to="/products"
              className="text-slate-500 transition hover:text-emerald-600"
            >
              Products
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-semibold text-slate-900">
              {product.name}
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT DETAILS
          ===================================================== */}

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* BACK BUTTON */}

          <Link
            to="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* =================================================
                PRODUCT IMAGE
                ================================================= */}

            <div>
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
                <div className="flex min-h-[520px] items-center justify-center bg-slate-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full min-h-[520px] w-full object-contain p-8"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="rounded-3xl bg-white/95 px-10 py-10 text-center shadow-xl">
                      <Package className="mx-auto h-14 w-14 text-emerald-500" />

                      <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                        Product Image
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Image will be added from the product catalogue
                      </p>
                    </div>
                  )}
                </div>

                {/* AVAILABILITY */}

                <div className="absolute left-5 top-5">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg ${
                      product.available ? "bg-emerald-500" : "bg-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />

                    {product.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* WISHLIST */}

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition ${
                    wishlist
                      ? "text-red-500"
                      : "text-slate-500 hover:text-red-500"
                  } ${
                    wishlistLoading
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                  aria-label={
                    wishlist
                      ? "Remove product from wishlist"
                      : "Add product to wishlist"
                  }
                  title={
                    wishlist
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`h-5 w-5 ${
                      wishlist ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

              {/* IMAGE NOTE */}

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />

                Product images and catalogue information can be updated
                through the pharmacy administration system.
              </div>

              {/* WISHLIST FEEDBACK */}

              {wishlistMessage && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
                    wishlistMessage
                      .toLowerCase()
                      .includes("added") ||
                    wishlistMessage
                      .toLowerCase()
                      .includes("removed")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                  role="status"
                >
                  {wishlistMessage}
                </div>
              )}
            </div>

            {/* =================================================
                PRODUCT INFORMATION
                ================================================= */}

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                {product.category}
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {product.name}
              </h1>

              {/* RATING */}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const filled =
                      index < Math.round(product.rating);

                    return (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${
                          filled
                            ? "fill-current text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    );
                  })}
                </div>

                <span className="text-sm font-semibold text-slate-600">
                  {product.rating > 0
                    ? product.rating.toFixed(1)
                    : "No rating"}
                </span>

                <span className="text-sm text-slate-400">
                  {product.reviews > 0
                    ? `(${product.reviews} reviews)`
                    : "(No reviews yet)"}
                </span>
              </div>

              {/* PRICE */}

              <div className="mt-8 rounded-2xl bg-slate-50 p-6">
                <p className="text-sm font-bold text-slate-500">
                  Current Price
                </p>

                <p className="mt-2 text-4xl font-black text-slate-950">
                  ₦{product.price.toLocaleString()}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Price shown from the Pharmablaze product catalogue.
                </p>
              </div>

              {/* STOCK */}

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <Package className="h-6 w-6 text-emerald-500" />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Stock Availability
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Currently out of stock"}
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-8">
                <h2 className="text-xl font-black text-slate-950">
                  Product Information
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  {product.description}
                </p>
              </div>

              {/* QUANTITY + CART */}

              <div className="mt-8 border-t border-slate-200 pt-8">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* QUANTITY */}

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1 sm:w-36">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={!product.available || addingToCart}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="font-bold text-slate-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={!product.available || addingToCart}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* CART */}

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.available || addingToCart}
                    className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl bg-emerald-500 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <ShoppingCart className="h-5 w-5" />

                    {addingToCart
                      ? "Adding to Cart..."
                      : product.available
                        ? "Add to Cart"
                        : "Out of Stock"}
                  </button>
                </div>

                {/* CART FEEDBACK */}

                {cartMessage && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
                      cartMessage
                        .toLowerCase()
                        .includes("successfully")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                    role="status"
                  >
                    {cartMessage}
                  </div>
                )}

                <p className="mt-4 text-center text-xs text-slate-400 sm:text-left">
                  Your cart is securely connected to the Pharmablaze
                  ordering system.
                </p>
              </div>

              {/* =================================================
                  SERVICE FEATURES
                  ================================================= */}

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <Truck className="h-6 w-6 text-emerald-500" />

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Order Support
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Get assistance with your pharmacy order.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <MapPin className="h-6 w-6 text-emerald-500" />

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Visit Us
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    235 Abak Rd, Uyo, Akwa Ibom.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Pharmacy Care
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pharmacy-related assistance available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PHARMACY NOTICE
          ===================================================== */}

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Need help with this product?
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  If you need more information about a product, contact
                  Pharmablaze Pharmacy before making a purchase. Product
                  availability, pricing and pharmacy requirements can be
                  confirmed by the pharmacy team.
                </p>

                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 font-bold text-emerald-600 transition hover:text-emerald-700"
                >
                  Contact Pharmablaze
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
          ===================================================== */}

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
            <img
              src="/images/pharmablaze-logo-transparent.png"
              alt="Pharmablaze Pharmacy"
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="mt-7 text-3xl font-black sm:text-4xl">
            Looking for something else?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Browse our product catalogue or contact Pharmablaze Pharmacy
            in Uyo for assistance.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 font-bold transition hover:bg-emerald-600"
            >
              Browse Products
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
