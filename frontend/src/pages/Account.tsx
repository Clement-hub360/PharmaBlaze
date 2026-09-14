import { useEffect, useState } from "react";

import {
  Bell,
  ChevronRight,
  FileText,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import {
  getMyPrescriptions,
  submitPrescription,
  type Prescription,
} from "../services/prescriptionService";

import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "../services/wishlistService";

type UserAccount = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
};

type OrderItem = {
  id?: string;
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number | string;
};

type Order = {
  id: string;
  total: number | string;
  status: string;
  deliveryMethod?: string | null;
  deliveryAddress?: string | null;
  paymentStatus?: string | null;
  createdAt: string;
  items?: OrderItem[];
};

type Tab =
  | "overview"
  | "orders"
  | "prescriptions"
  | "wishlist"
  | "addresses"
  | "notifications"
  | "security";

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
};

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status.replaceAll("_", " ");
}

function getStatusClass(status: string) {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
    case "DELIVERED":
    case "APPROVED":
    case "FULFILLED":
      return "bg-green-100 text-green-700";

    case "PROCESSING":
    case "READY_FOR_PICKUP":
    case "OUT_FOR_DELIVERY":
    case "SHIPPED":
    case "REVIEWING":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
    case "REJECTED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPrescriptionFileUrl(fileUrl: string) {
  if (!fileUrl) {
    return "";
  }

  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  const apiBaseUrl = "http://localhost:5000";

  return `${apiBaseUrl}${fileUrl}`;
}

export default function Account() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [user, setUser] = useState<UserAccount | null>(null);

  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [ordersLoading, setOrdersLoading] = useState(false);

  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);

  const [prescriptionMessage, setPrescriptionMessage] = useState("");

  const [prescriptionMessageType, setPrescriptionMessageType] = useState<
    "success" | "error" | ""
  >("");

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);

    const token = localStorage.getItem("pharmablaze_token");

    if (!token) {
      setLoading(false);

      navigate("/login", {
        replace: true,
        state: {
          from: "/account",
        },
      });

      return;
    }

    try {
      const storedUser = localStorage.getItem("pharmablaze_user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as UserAccount;

          setUser(parsedUser);
        } catch {
          localStorage.removeItem("pharmablaze_user");
        }
      }

      const response = await api.get("/auth/me");

      const authenticatedUser =
        response.data?.data?.user ?? response.data?.data ?? response.data?.user;

      if (authenticatedUser) {
        setUser(authenticatedUser);

        localStorage.setItem(
          "pharmablaze_user",
          JSON.stringify(authenticatedUser),
        );
      }

      await Promise.all([loadOrders(), loadPrescriptions(), loadWishlist()]);
    } catch (error: any) {
      console.error("Unable to load account:", error);

      if (error?.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);

    try {
      const response = await api.get("/orders/my-orders");

      const accountOrders =
        response.data?.data?.orders ??
        response.data?.data ??
        response.data?.orders ??
        [];

      setOrders(Array.isArray(accountOrders) ? accountOrders : []);
    } catch (error: any) {
      console.error("Unable to load orders:", error);

      if (error?.response?.status === 401) {
        handleLogout();
        return;
      }

      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadPrescriptions() {
    setPrescriptionsLoading(true);

    try {
      const result = await getMyPrescriptions();

      setPrescriptions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load prescriptions:", error);

      setPrescriptions([]);
    } finally {
      setPrescriptionsLoading(false);
    }
  }

  async function loadWishlist() {
    setWishlistLoading(true);

    try {
      const result = await getWishlist();

      setWishlist(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load wishlist:", error);

      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("pharmablaze_token");

    localStorage.removeItem("pharmablaze_user");

    window.dispatchEvent(new Event("pharmablaze-auth-change"));

    navigate("/", {
      replace: true,
    });
  }

  function handlePrescriptionFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setPrescriptionMessage("");
    setPrescriptionMessageType("");

    if (!file) {
      setPrescriptionFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setPrescriptionFile(null);

      event.target.value = "";

      setPrescriptionMessage(
        "Invalid file type. Please select a JPG, PNG, or PDF file.",
      );

      setPrescriptionMessageType("error");

      return;
    }

    if (file.size > maxSize) {
      setPrescriptionFile(null);

      event.target.value = "";

      setPrescriptionMessage(
        "File is too large. Please select a file smaller than 10 MB.",
      );

      setPrescriptionMessageType("error");

      return;
    }

    setPrescriptionFile(file);
  }

  async function handlePrescriptionSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPrescriptionMessage("");
    setPrescriptionMessageType("");

    if (!prescriptionFile) {
      setPrescriptionMessage("Please select a prescription file.");

      setPrescriptionMessageType("error");

      return;
    }

    setPrescriptionSubmitting(true);

    try {
      await submitPrescription({
        file: prescriptionFile,
        notes: prescriptionNotes.trim() || undefined,
      });

      setPrescriptionFile(null);
      setPrescriptionNotes("");

      const fileInput = document.getElementById(
        "prescription-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setPrescriptionMessage(
        "Prescription uploaded successfully. Our pharmacy team will review it.",
      );

      setPrescriptionMessageType("success");

      await loadPrescriptions();
    } catch (error: any) {
      console.error("Unable to submit prescription:", error);

      setPrescriptionMessage(
        error?.response?.data?.message ??
          "Unable to upload prescription. Please try again.",
      );

      setPrescriptionMessageType("error");
    } finally {
      setPrescriptionSubmitting(false);
    }
  }

  async function handleRemoveWishlist(productId: string) {
    try {
      await removeFromWishlist(productId);

      setWishlist((currentWishlist) =>
        currentWishlist.filter((item) => item.productId !== productId),
      );
    } catch (error) {
      console.error("Unable to remove wishlist item:", error);
    }
  }

  const totalSpent = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0,
  );

  const sidebarItems: Array<{
    id: Tab;
    label: string;
    icon: React.ElementType;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: User,
    },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: FileText,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

              <p className="text-gray-600">Loading your account...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-green-100">
                My Account
              </p>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Welcome, {user.name}
              </h1>

              <p className="mt-2 max-w-2xl text-green-50">
                Manage your orders, prescriptions, wishlist, and account
                settings from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* SIDEBAR */}
            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-3 rounded-xl bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Signed in as
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                  {user.email}
                </p>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;

                  const active = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "bg-green-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />

                        {item.label}
                      </span>

                      <ChevronRight className="h-4 w-4" />
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* CONTENT */}
            <div className="min-w-0">
              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Account Overview
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Here is a quick summary of your Pharmablaze account.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-xl bg-green-100 p-3">
                          <Package className="h-6 w-6 text-green-700" />
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <p className="mt-5 text-3xl font-bold text-gray-900">
                        {orders.length}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">Total Orders</p>
                    </button>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="w-fit rounded-xl bg-blue-100 p-3">
                        <ShieldCheck className="h-6 w-6 text-blue-700" />
                      </div>

                      <p className="mt-5 text-2xl font-bold text-gray-900">
                        {formatPrice(totalSpent)}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">Total Spent</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("wishlist")}
                      className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-xl bg-red-100 p-3">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <p className="mt-5 text-3xl font-bold text-gray-900">
                        {wishlist.length}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Wishlist Items
                      </p>
                    </button>
                  </div>

                  {/* PERSONAL INFORMATION */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Personal Information
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Your account details.
                        </p>
                      </div>

                      <User className="h-6 w-6 text-green-600" />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Full Name
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {user.name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Email
                        </p>

                        <p className="mt-1 break-words font-medium text-gray-900">
                          {user.email || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Phone
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {user.phone || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Account Type
                        </p>

                        <p className="mt-1 font-medium capitalize text-gray-900">
                          {user.role?.toLowerCase() || "Customer"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RECENT ORDERS */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Recent Orders
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Your latest purchases.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className="text-sm font-semibold text-green-700 hover:text-green-800"
                      >
                        View all
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="rounded-xl bg-gray-50 p-8 text-center">
                        <Package className="mx-auto h-10 w-10 text-gray-400" />

                        <p className="mt-3 font-semibold text-gray-900">
                          No orders yet
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Your completed orders will appear here.
                        </p>

                        <button
                          type="button"
                          onClick={() => navigate("/products")}
                          className="mt-5 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          Browse Products
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                Order #{item.id}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {formatDate(item.createdAt)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  item.status,
                                )}`}
                              >
                                {getStatusLabel(item.status)}
                              </span>

                              <span className="font-bold text-gray-900">
                                {formatPrice(item.total)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      My Orders
                    </h2>

                    <p className="mt-1 text-gray-600">
                      View your order history and current order status.
                    </p>
                  </div>

                  {ordersLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                      <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

                      <p className="text-gray-600">Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />

                      <h3 className="mt-4 text-lg font-bold text-gray-900">
                        No orders found
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        You have not placed any orders yet. Once you place an
                        order, it will appear here.
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((item) => (
                        <div
                          key={item.id}
                          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Order
                              </p>

                              <h3 className="mt-1 break-all text-base font-bold text-gray-900">
                                #{item.id}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                Placed on {formatDate(item.createdAt)}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  item.status,
                                )}`}
                              >
                                {getStatusLabel(item.status)}
                              </span>

                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(item.total)}
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Fulfilment
                              </p>

                              <p className="mt-1 font-medium text-gray-900">
                                {item.deliveryMethod === "PICKUP"
                                  ? "Pickup"
                                  : "Delivery"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Payment
                              </p>

                              <p className="mt-1 font-medium text-gray-900">
                                {item.paymentStatus || "Pending"}
                              </p>
                            </div>
                          </div>

                          {item.deliveryAddress && (
                            <div className="border-t border-gray-100 px-5 py-4">
                              <div className="flex gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Delivery Address
                                  </p>

                                  <p className="mt-1 text-sm text-gray-700">
                                    {item.deliveryAddress}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {item.items && item.items.length > 0 && (
                            <div className="border-t border-gray-100 px-5 py-4">
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Items
                              </p>

                              <div className="space-y-2">
                                {item.items.map((orderItem, index) => (
                                  <div
                                    key={
                                      orderItem.id ??
                                      `${orderItem.productId}-${index}`
                                    }
                                    className="flex items-center justify-between gap-4 text-sm"
                                  >
                                    <span className="text-gray-700">
                                      {orderItem.name ||
                                        orderItem.productId ||
                                        "Product"}{" "}
                                      × {orderItem.quantity ?? 1}
                                    </span>

                                    {orderItem.price !== undefined && (
                                      <span className="font-semibold text-gray-900">
                                        {formatPrice(
                                          Number(orderItem.price) *
                                            (orderItem.quantity ?? 1),
                                        )}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PRESCRIPTIONS */}
              {activeTab === "prescriptions" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Prescriptions
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Upload and track your prescriptions securely.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900">
                      Submit a Prescription
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Upload a clear photo or PDF of your prescription. Maximum
                      file size is 10 MB.
                    </p>

                    <form
                      onSubmit={handlePrescriptionSubmit}
                      className="mt-5 space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="prescription-file"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Prescription File
                        </label>

                        <input
                          id="prescription-file"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                          onChange={handlePrescriptionFileChange}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                          Accepted formats: JPG, PNG, PDF. Maximum size: 10 MB.
                        </p>

                        {prescriptionFile && (
                          <div className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            Selected:{" "}
                            <span className="font-semibold">
                              {prescriptionFile.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="prescription-notes"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Notes
                        </label>

                        <textarea
                          id="prescription-notes"
                          value={prescriptionNotes}
                          onChange={(event) =>
                            setPrescriptionNotes(event.target.value)
                          }
                          rows={4}
                          placeholder="Add any notes for our pharmacy team..."
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                      </div>

                      {prescriptionMessage && (
                        <div
                          className={`rounded-lg px-4 py-3 text-sm ${
                            prescriptionMessageType === "error"
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {prescriptionMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={prescriptionSubmitting}
                        className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {prescriptionSubmitting
                          ? "Uploading..."
                          : "Upload Prescription"}
                      </button>
                    </form>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900">
                      Prescription History
                    </h3>

                    {prescriptionsLoading ? (
                      <div className="py-10 text-center text-gray-500">
                        Loading prescriptions...
                      </div>
                    ) : prescriptions.length === 0 ? (
                      <div className="py-10 text-center">
                        <FileText className="mx-auto h-10 w-10 text-gray-400" />

                        <p className="mt-3 font-semibold text-gray-900">
                          No prescriptions yet
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {prescriptions.map((prescription, index) => (
                          <div
                            key={prescription.id ?? index}
                            className="rounded-xl border border-gray-200 p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Prescription #{prescription.id}
                                </p>

                                <p className="text-sm text-gray-500">
                                  {prescription.createdAt
                                    ? formatDate(prescription.createdAt)
                                    : "Date unavailable"}
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  prescription.status,
                                )}`}
                              >
                                {getStatusLabel(prescription.status)}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              {prescription.fileUrl && (
                                <a
                                  href={getPrescriptionFileUrl(
                                    prescription.fileUrl,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                                >
                                  <FileText className="h-4 w-4" />
                                  View Prescription
                                </a>
                              )}
                            </div>

                            {prescription.notes && (
                              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Notes
                                </p>

                                <p className="mt-1 text-sm text-gray-700">
                                  {prescription.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WISHLIST */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Wishlist
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Products you saved for later.
                    </p>
                  </div>

                  {wishlistLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                      Loading wishlist...
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                      <Heart className="mx-auto h-12 w-12 text-gray-400" />

                      <h3 className="mt-4 text-lg font-bold text-gray-900">
                        Your wishlist is empty
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Save products you are interested in and they will appear
                        here.
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {wishlist.map((item) => (
                        <div
                          key={item.productId}
                          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                          <div className="aspect-square bg-gray-100">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <h3 className="font-bold text-gray-900">
                              {item.product?.name || "Product"}
                            </h3>

                            {item.product?.price !== undefined && (
                              <p className="mt-2 font-semibold text-green-700">
                                {formatPrice(item.product.price)}
                              </p>
                            )}

                            <div className="mt-4 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/products/${item.productId}`)
                                }
                                className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                              >
                                View Product
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveWishlist(item.productId)
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Addresses
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Your saved delivery information.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="rounded-xl bg-green-100 p-3">
                        <MapPin className="h-6 w-6 text-green-700" />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          Delivery Address
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                          You can provide your delivery address during checkout.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Notifications
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Important updates about your account and orders.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="rounded-xl bg-blue-100 p-3">
                        <Bell className="h-6 w-6 text-blue-700" />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          Notifications are currently quiet
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Order and prescription updates will appear here when
                          available.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Security
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Manage your account security.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="rounded-xl bg-green-100 p-3">
                        <ShieldCheck className="h-6 w-6 text-green-700" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          Account Security
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Your account is protected by authenticated sessions.
                        </p>

                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4" />
                          Account Login
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
