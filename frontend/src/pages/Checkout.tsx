import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

import { clearCart, getCart } from "../services/cartService";
import type { Cart } from "../services/cartService";
import api from "../services/api";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
};

type CreatedOrderItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number | string;
};

type CreatedOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: "DELIVERY" | "PICKUP";
  deliveryAddress?: string | null;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  status: string;
  paymentMethod: "PAY_ON_CONFIRMATION" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentReference?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
  items: CreatedOrderItem[];
};

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Confirmed";

    case "PROCESSING":
      return "Processing";

    case "READY_FOR_PICKUP":
      return "Ready for Pickup";

    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";

    case "COMPLETED":
      return "Completed";

    case "DELIVERED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status.replaceAll("_", " ");
  }
}

function Checkout() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const [user, setUser] = useState<AuthUser | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery",
  );

  const [paymentMethod] = useState<"pay-on-confirmation" | "online">(
    "pay-on-confirmation",
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  /*
   * Load authenticated user from localStorage.
   */
  useEffect(() => {
    const token = localStorage.getItem("pharmablaze_token");
    const savedUser = localStorage.getItem("pharmablaze_user");

    if (!token || !savedUser) {
      setLoadingCart(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser) as AuthUser;

      setUser(parsedUser);

      const nameParts = parsedUser.name.trim().split(/\s+/);

      setFirstName(nameParts[0] ?? "");
      setLastName(nameParts.slice(1).join(" "));
      setEmail(parsedUser.email);
      setPhone(parsedUser.phone ?? "");
    } catch (error) {
      console.error("Failed to read saved account information:", error);
    }
  }, []);

  /*
   * Load customer's database cart.
   */
  useEffect(() => {
    const token = localStorage.getItem("pharmablaze_token");

    if (!token) {
      setLoadingCart(false);
      return;
    }

    async function loadCart() {
      try {
        setLoadingCart(true);
        setErrorMessage("");

        const currentCart = await getCart();

        setCart(currentCart);
      } catch (error: any) {
        console.error("Checkout cart error:", error);

        if (error?.response?.status === 401) {
          setErrorMessage(
            "Your session has expired. Please sign in again before checking out.",
          );
        } else {
          setErrorMessage(
            "We could not load your cart. Please refresh the page and try again.",
          );
        }
      } finally {
        setLoadingCart(false);
      }
    }

    void loadCart();
  }, []);

  /*
   * Frontend subtotal is for display only.
   * The backend remains authoritative for the real order total.
   */
  const subtotal = useMemo(() => {
    if (!cart) {
      return 0;
    }

    return cart.items.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);
  }, [cart]);

  /*
   * Current estimated delivery fee.
   * Backend calculates the final fee.
   */
  const estimatedDeliveryFee = deliveryMethod === "delivery" ? 1500 : 0;

  const estimatedTotal = subtotal + estimatedDeliveryFee;

  const cartIsEmpty = !cart || cart.items.length === 0;

  /*
   * Convert frontend payment method to backend value.
   */
  const backendPaymentMethod =
    paymentMethod === "online" ? "ONLINE" : "PAY_ON_CONFIRMATION";

  /*
   * Submit order.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrorMessage("");

    const token = localStorage.getItem("pharmablaze_token");

    if (!token || !user) {
      setErrorMessage(
        "Please sign in to your Pharmablaze account before placing an order.",
      );
      return;
    }

    if (!cart || cart.items.length === 0) {
      setErrorMessage(
        "Your cart is empty. Please add a product before checking out.",
      );
      return;
    }

    if (paymentMethod === "online") {
      setErrorMessage(
        "Online payment is not connected yet. Please use Pay on Confirmation.",
      );
      return;
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanNotes = notes.trim();

    if (!cleanFirstName) {
      setErrorMessage("Please enter your first name.");
      return;
    }

    if (!cleanLastName) {
      setErrorMessage("Please enter your last name.");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!cleanPhone) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    if (cleanPhone.length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (deliveryMethod === "delivery" && !cleanAddress) {
      setErrorMessage("Please enter your delivery address.");
      return;
    }

    const fullName = `${cleanFirstName} ${cleanLastName}`.trim();

    setSubmitting(true);

    try {
      /*
       * Only send product IDs and quantities.
       * The backend calculates product prices securely.
       */
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const payload = {
        customerName: fullName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,

        deliveryMethod: deliveryMethod === "delivery" ? "DELIVERY" : "PICKUP",

        ...(deliveryMethod === "delivery"
          ? {
              deliveryAddress: cleanAddress,
            }
          : {}),

        items: orderItems,

        paymentMethod: backendPaymentMethod,

        ...(cleanNotes
          ? {
              notes: cleanNotes,
            }
          : {}),
      };

      console.log("Submitting order:", payload);

      const response = await api.post("/orders", payload);

      console.log("Order creation response:", response.data);

      /*
       * Support the possible backend response formats.
       */
      const createdOrder =
        response.data?.data?.order ??
        response.data?.data ??
        response.data?.order;

      /*
       * Never show a false success screen.
       */
      if (!createdOrder?.id) {
        throw new Error(
          "The order was created, but the server did not return the order details.",
        );
      }

      /*
       * Save the successfully created order.
       */
      setOrder(createdOrder as CreatedOrder);

      /*
       * Clear the server-side cart.
       *
       * If this fails, the order itself still exists.
       */
      try {
        await clearCart();
      } catch (clearCartError) {
        console.error(
          "Order was created, but clearing the cart failed:",
          clearCartError,
        );
      }

      /*
       * Clear the local checkout cart.
       */
      setCart({
        ...cart,
        items: [],
      });

      /*
       * Show success screen.
       */
      setSubmitted(true);
    } catch (error: any) {
      console.error("Checkout error:", error);

      if (error?.response?.status === 401) {
        setErrorMessage(
          "Your session has expired. Please sign in again before placing the order.",
        );
      } else if (
        error?.response?.status === 400 &&
        error?.response?.data?.message
      ) {
        setErrorMessage(error.response.data.message);
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "We could not place your order. Please check your information and try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Authentication required screen.
   */
  if (!localStorage.getItem("pharmablaze_token") || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <img
              src="/images/checkout-background.jpg"
              alt=""
              className="h-full w-full object-cover opacity-20"
            />

            <div className="absolute inset-0 bg-slate-950/80" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <ShoppingBag size={16} />
              Secure Checkout
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Complete Your
              <span className="block text-emerald-400">Order</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Sign in to your Pharmablaze account before continuing with your
              order.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <User size={38} />
              </div>

              <h2 className="mt-7 text-3xl font-black text-slate-900">
                Sign in required
              </h2>

              <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
                Please sign in to your Pharmablaze account so your order can be
                securely connected to your account.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"
                >
                  Sign In
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={18} />
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Cart loading screen.
   */
  if (loadingCart) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-5 font-semibold text-slate-600">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Successful order screen.
   */
  if (submitted && order) {
    const paymentLabel =
      order.paymentMethod === "ONLINE"
        ? "Online Payment"
        : "Pay on Confirmation";

    const deliveryLabel =
      order.deliveryMethod === "DELIVERY" ? "Delivery" : "Pharmacy Pickup";

    return (
      <div className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <img
              src="/images/checkout-background.jpg"
              alt=""
              className="h-full w-full object-cover opacity-20"
            />

            <div className="absolute inset-0 bg-slate-950/80" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 size={16} />
              Order Confirmed
            </span>

            <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl">
              Thank you for your
              <span className="block text-emerald-400">order.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Your order has been successfully received by Pharmablaze Pharmacy.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={42} />
                </div>

                <h2 className="mt-7 text-3xl font-black text-slate-900">
                  Order received successfully
                </h2>

                <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
                  Your order has been securely created and saved. Pharmablaze
                  Pharmacy can now review and process your order.
                </p>
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Order ID</p>

                    <p className="mt-1 break-all font-bold text-slate-900">
                      {order.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Order Status</p>

                    <p className="mt-1 font-bold text-emerald-600">
                      {formatStatus(order.status)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Customer</p>

                    <p className="mt-1 font-bold text-slate-900">
                      {order.customerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Payment</p>

                    <p className="mt-1 font-bold text-slate-900">
                      {paymentLabel}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Fulfilment</p>

                    <p className="mt-1 font-bold text-slate-900">
                      {deliveryLabel}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Payment Status</p>

                    <p className="mt-1 font-bold text-amber-600">
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {order.deliveryAddress && (
                <div className="mt-6 rounded-2xl border border-slate-200 p-6">
                  <div className="flex gap-3">
                    <MapPin
                      size={21}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Delivery Address
                      </h3>

                      <p className="mt-1 leading-6 text-slate-600">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-slate-200 p-6">
                <h3 className="font-black text-slate-900">Order Summary</h3>

                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>

                        <p className="mt-1 text-sm text-slate-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-bold text-slate-900">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>

                    <span className="font-bold text-slate-900">
                      {formatPrice(Number(order.subtotal))}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-slate-500">Delivery</span>

                    <span className="font-bold text-slate-900">
                      {Number(order.deliveryFee) === 0
                        ? "Free"
                        : formatPrice(Number(order.deliveryFee))}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">Total</span>

                      <span className="text-2xl font-black text-emerald-600">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Pharmacy confirmation
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Your order has been submitted for pharmacy review. Payment
                      instructions and final order arrangements will be provided
                      during confirmation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/account"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"
                >
                  View My Orders
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Empty cart screen.
   */
  if (cartIsEmpty) {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <ShoppingBag size={38} />
              </div>

              <h1 className="mt-7 text-3xl font-black text-slate-900">
                Your cart is empty
              </h1>

              <p className="mt-4 leading-7 text-slate-600">
                Add products to your cart before proceeding to checkout.
              </p>

              <Link
                to="/products"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"
              >
                Browse Products
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="/images/checkout-background.jpg"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />

          <div className="absolute inset-0 bg-slate-950/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <ShoppingBag size={16} />
              Secure Checkout
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Complete Your
              <span className="block text-emerald-400">Order</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Review your cart and provide your contact and delivery information
              to place your order.
            </p>
          </div>
        </div>
      </section>

      {/* CHECKOUT */}
      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/cart"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[1fr_390px]"
          >
            {/* LEFT */}
            <div className="space-y-6">
              {/* CUSTOMER INFORMATION */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <User size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Customer Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your account information is used for this order.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Your first name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Your last name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="0912 828 6533"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* DELIVERY */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Delivery Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose how you would like to receive your order.
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  <label
                    className={`block cursor-pointer rounded-2xl border p-5 transition ${
                      deliveryMethod === "delivery"
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-4">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={deliveryMethod === "delivery"}
                        onChange={() => setDeliveryMethod("delivery")}
                        className="mt-1 accent-emerald-600"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Truck size={18} className="text-emerald-600" />

                            <span className="font-bold text-slate-900">
                              Delivery
                            </span>
                          </div>

                          <span className="font-bold text-slate-900">
                            ₦1,500
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Your delivery details will be reviewed by the pharmacy
                          during order processing.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block cursor-pointer rounded-2xl border p-5 transition ${
                      deliveryMethod === "pickup"
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-4">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={deliveryMethod === "pickup"}
                        onChange={() => setDeliveryMethod("pickup")}
                        className="mt-1 accent-emerald-600"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-emerald-600" />

                          <span className="font-bold text-slate-900">
                            Pharmacy Pickup
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Pickup location: 235 Abak Rd, Uyo 520104, Akwa Ibom,
                          Nigeria.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {deliveryMethod === "delivery" && (
                  <div className="mt-6">
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Delivery Address
                    </label>

                    <textarea
                      id="address"
                      required
                      autoComplete="street-address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      rows={4}
                      placeholder="Enter your delivery address..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                )}
              </div>

              {/* PAYMENT */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CreditCard size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Payment Method
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Select your preferred payment option.
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  <label className="block cursor-pointer rounded-2xl border border-emerald-500 bg-emerald-50/50 p-5 transition">
                    <div className="flex gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay-on-confirmation"
                        checked={paymentMethod === "pay-on-confirmation"}
                        readOnly
                        className="mt-1 accent-emerald-600"
                      />

                      <div>
                        <p className="font-bold text-slate-900">
                          Pay on Confirmation
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Payment instructions will be provided after the
                          pharmacy confirms your order.
                        </p>
                      </div>
                    </div>
                  </label>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex gap-4">
                      <div className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900">
                            Online Payment
                          </p>

                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                            Coming Soon
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Online payment will be enabled after an approved
                          payment provider is configured.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Phone size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Additional Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add an optional note for the pharmacy.
                    </p>
                  </div>
                </div>

                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any relevant order notes..."
                  className="mt-7 w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {/* ERROR */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold leading-6 text-red-700"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            {/* RIGHT / SUMMARY */}
            <aside>
              <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                  <h2 className="text-xl font-black text-slate-900">
                    Order Summary
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={
                              item.product.image ||
                              "/images/product-placeholder.jpg"
                            }
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">
                            {item.product.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="font-bold text-slate-900">
                          {formatPrice(
                            Number(item.product.price) * item.quantity,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>

                      <span className="font-bold text-slate-900">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Delivery</span>

                      <span className="font-bold text-slate-900">
                        {estimatedDeliveryFee === 0
                          ? "Free"
                          : formatPrice(estimatedDeliveryFee)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">
                          Estimated Total
                        </span>

                        <span className="text-2xl font-black text-emerald-600">
                          {formatPrice(estimatedTotal)}
                        </span>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Final pricing is calculated and verified securely by the
                        pharmacy ordering system when your order is submitted.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <div className="flex gap-3">
                      <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <p className="text-xs leading-5 text-slate-500">
                        Your order is securely connected to your Pharmablaze
                        account and will be saved to the pharmacy ordering
                        system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="px-6 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[300px] bg-slate-800">
              <img
                src="/images/checkout-support.jpg"
                alt="Pharmablaze Pharmacy support"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-slate-950/20" />
            </div>

            <div className="p-8 sm:p-10 lg:p-14">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400">
                <ShieldCheck size={17} />
                Pharmacy Order Support
              </span>

              <h2 className="mt-5 text-3xl font-black text-white">
                Need help before placing your order?
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                If you have questions about a product, availability, delivery,
                or pharmacy requirements, contact Pharmablaze Pharmacy before
                completing your order.
              </p>

              <a
                href="tel:09128286533"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-400"
              >
                <Phone size={18} />
                0912 828 6533
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Checkout;
