import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
  type Cart,
} from "../services/cartService";

function formatPrice(value: number | string) {
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("pharmablaze_token");

  async function loadCart() {
    if (!token) {
      setLoading(false);
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your cart."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
  }, []);

  const subtotal = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const unavailableItems = useMemo(() => {
    if (!cart) return [];

    return cart.items.filter(
      (item) =>
        item.product.status !== "ACTIVE" ||
        item.product.stock <= 0 ||
        item.quantity > item.product.stock,
    );
  }, [cart]);

  const checkoutBlocked = unavailableItems.length > 0;

  async function handleIncrease(
    productId: string,
    currentQuantity: number,
    stock: number,
  ) {
    if (currentQuantity >= stock) {
      setError(`Only ${stock} unit${stock === 1 ? "" : "s"} available.`);
      return;
    }

    try {
      setActionKey(`increase-${productId}`);
      setError("");
      setSuccess("");

      const updatedCart = await updateCartItem(productId, currentQuantity + 1);

      setCart(updatedCart);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update the cart quantity."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleDecrease(productId: string, currentQuantity: number) {
    if (currentQuantity <= 1) {
      await handleRemove(productId);
      return;
    }

    try {
      setActionKey(`decrease-${productId}`);
      setError("");
      setSuccess("");

      const updatedCart = await updateCartItem(productId, currentQuantity - 1);

      setCart(updatedCart);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update the cart quantity."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleRemove(productId: string) {
    try {
      setActionKey(`remove-${productId}`);
      setError("");
      setSuccess("");

      const updatedCart = await removeFromCart(productId);

      setCart(updatedCart);
      setSuccess("Item removed from your cart.");

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to remove this item from your cart."),
      );
    } finally {
      setActionKey(null);
    }
  }

  async function handleClearCart() {
    if (!cart || cart.items.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?",
    );

    if (!confirmed) return;

    try {
      setActionKey("clear");
      setError("");
      setSuccess("");

      const updatedCart = await clearCart();

      if (updatedCart) {
        setCart(updatedCart);
      } else {
        setCart({
          ...cart,
          items: [],
          updatedAt: new Date().toISOString(),
        });
      }

      setSuccess("Your cart has been cleared.");

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to clear your cart."));
    } finally {
      setActionKey(null);
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <ShoppingBag size={36} />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Your Cart
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-slate-600">
              Please sign in to access your shopping cart and continue with your
              order.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/account"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Sign In
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-blue-700"
              />
              <p className="mt-4 font-medium text-slate-600">
                Loading your cart...
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={32} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              We couldn't load your cart
            </h1>

            <p className="mt-3 text-slate-600">{error}</p>

            <button
              type="button"
              onClick={() => void loadCart()}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Shopping Cart
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              Your cart is empty
            </h1>
          </div>

          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <ShoppingBag size={42} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Nothing here yet
              </h2>

              <p className="mt-3 text-slate-600">
                Browse our products and add the items you need to your cart.
                Your cart will be saved securely to your account.
              </p>

              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Browse Products
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Shopping Cart
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                Your Cart
              </h1>

              <p className="mt-2 text-slate-600">
                {totalItems} item{totalItems === 1 ? "" : "s"} in your cart
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleClearCart()}
              disabled={actionKey === "clear"}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
            >
              <Trash2 size={17} />
              {actionKey === "clear" ? "Clearing..." : "Clear Cart"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Cart update failed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        {checkoutBlocked && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Some items need attention</p>

              <p className="mt-1 text-sm">
                One or more products are unavailable or have less stock than the
                quantity in your cart. Please update your cart before checkout.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const product = item.product;
              const itemTotal = Number(product.price) * item.quantity;

              const busy = actionKey !== null;
              const atStockLimit =
                product.stock > 0 && item.quantity >= product.stock;

              const unavailable =
                product.status !== "ACTIVE" ||
                product.stock <= 0 ||
                item.quantity > product.stock;

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:h-32 sm:w-32"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ShoppingBag size={38} className="text-slate-400" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <Link
                            to={`/products/${product.id}`}
                            className="text-lg font-bold text-slate-900 transition hover:text-blue-700"
                          >
                            {product.name}
                          </Link>

                          {product.category && (
                            <p className="mt-1 text-sm text-slate-500">
                              {product.category.name}
                            </p>
                          )}
                        </div>

                        <p className="text-lg font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {unavailable && (
                        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                          {product.stock <= 0
                            ? "This product is currently out of stock."
                            : product.status !== "ACTIVE"
                              ? "This product is currently unavailable."
                              : `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} currently available.`}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDecrease(product.id, item.quantity)
                            }
                            disabled={busy}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={17} />
                          </button>

                          <span className="flex h-10 min-w-12 items-center justify-center border-x border-slate-200 px-3 text-sm font-bold text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              void handleIncrease(
                                product.id,
                                item.quantity,
                                product.stock,
                              )
                            }
                            disabled={busy || atStockLimit}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={17} />
                          </button>
                        </div>

                        <div className="flex items-center gap-5">
                          <p className="font-bold text-slate-900">
                            {formatPrice(itemTotal)}
                          </p>

                          <button
                            type="button"
                            onClick={() => void handleRemove(product.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>

                      {product.stock > 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                          {product.stock} unit
                          {product.stock === 1 ? "" : "s"} currently available
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Truck size={22} className="mt-0.5 text-blue-700" />

                <div>
                  <p className="font-semibold text-slate-900">
                    Delivery available in Uyo
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Delivery fees are calculated securely during checkout.
                  </p>
                </div>
              </div>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Subtotal ({totalItems} item
                  {totalItems === 1 ? "" : "s"})
                </span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery</span>
                <span className="text-sm font-medium text-slate-500">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    Estimated Total
                  </span>

                  <span className="text-xl font-bold text-blue-700">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Final total may include the applicable delivery fee selected
                  at checkout.
                </p>
              </div>
            </div>

            {checkoutBlocked ? (
              <button
                type="button"
                disabled
                className="mt-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 py-3.5 font-bold text-slate-600"
              >
                Update Cart to Continue
              </button>
            ) : (
              <Link
                to="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white transition hover:bg-blue-800"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>
            )}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Secure ordering
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your cart is connected to your Pharmablaze account and stored in
                the database.
              </p>
            </div>

            <Link
              to="/contact"
              className="mt-5 block text-center text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Need help with your order?
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
