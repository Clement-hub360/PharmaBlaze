import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

type BackendOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

type DeliveryMethod = "DELIVERY" | "PICKUP";

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type BackendOrder = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: BackendOrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: OrderUser;
};

const statusOptions: BackendOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

const statusLabels: Record<BackendOrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const methodLabels: Record<DeliveryMethod, string> = {
  DELIVERY: "Delivery",
  PICKUP: "Pharmacy Pickup",
};

function AdminOrders() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [methodFilter, setMethodFilter] = useState("All Methods");

  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<BackendOrderStatus>("PENDING");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusStyle = (status: BackendOrderStatus) => {
    switch (status) {
      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "CONFIRMED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "PROCESSING":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "READY_FOR_PICKUP":
        return "border-cyan-200 bg-cyan-50 text-cyan-700";

      case "OUT_FOR_DELIVERY":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";

      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";
    }
  };

  const getStatusIcon = (status: BackendOrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock3 size={14} />;

      case "CONFIRMED":
        return <CircleCheck size={14} />;

      case "PROCESSING":
        return <Package size={14} />;

      case "READY_FOR_PICKUP":
        return <ShoppingBag size={14} />;

      case "OUT_FOR_DELIVERY":
        return <Truck size={14} />;

      case "COMPLETED":
        return <CircleCheck size={14} />;

      case "CANCELLED":
        return <XCircle size={14} />;
    }
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

      if (response?.data?.message) {
        return response.data.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  };

  const loadOrders = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const response = await api.get("/orders");

      const fetchedOrders = response.data?.data;

      if (!Array.isArray(fetchedOrders)) {
        throw new Error("Invalid orders response from server");
      }

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Load admin orders error:", error);

      setOrders([]);
      setErrorMessage(getErrorMessage(error, "Unable to load orders"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderDetails = async (order: BackendOrder) => {
    try {
      setDetailsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.get(`/orders/${order.id}`);

      const fetchedOrder = response.data?.data;

      if (!fetchedOrder) {
        throw new Error("Order details could not be loaded");
      }

      setSelectedOrder(fetchedOrder);
      setSelectedStatus(fetchedOrder.status);
    } catch (error) {
      console.error("Load order details error:", error);

      setErrorMessage(getErrorMessage(error, "Unable to load order details"));
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.patch(`/orders/${selectedOrder.id}/status`, {
        status: selectedStatus,
      });

      const updatedOrder = response.data?.data;

      if (!updatedOrder) {
        throw new Error("The server did not return the updated order");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? {
                ...order,
                ...updatedOrder,
              }
            : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder
          ? {
              ...currentOrder,
              ...updatedOrder,
            }
          : currentOrder,
      );

      setSelectedStatus(updatedOrder.status);

      setSuccessMessage(
        `Order status updated to ${statusLabels[updatedOrder.status as BackendOrderStatus]}.`,
      );
    } catch (error) {
      console.error("Update order status error:", error);

      setErrorMessage(getErrorMessage(error, "Unable to update order status"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        search === "" ||
        order.id.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        order.customerPhone.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All Status" ||
        statusLabels[order.status] === statusFilter;

      const matchesMethod =
        methodFilter === "All Methods" ||
        methodLabels[order.deliveryMethod] === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [orders, searchTerm, statusFilter, methodFilter]);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const activeStatuses: BackendOrderStatus[] = [
    "CONFIRMED",
    "PROCESSING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
  ];

  const activeOrders = orders.filter((order) =>
    activeStatuses.includes(order.status),
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED",
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total), 0);

  const selectedOrderItemCount =
    selectedOrder?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <ShoppingBag size={17} />
                Order Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Orders
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Review customer orders, monitor order progress, and manage
                delivery or pharmacy pickup requests.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadOrders(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Estimated Order Revenue
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {errorMessage && (
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <div>
              <p className="text-sm font-bold">Unable to load orders</p>
              <p className="mt-1 text-sm">{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        </section>
      )}

      {/* Summary Cards */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pendingOrders}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-amber-600">Awaiting confirmation</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {activeOrders}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Package size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-blue-600">
              Currently being processed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {completedOrders}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CircleCheck size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-emerald-600">
              Successfully completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Cancelled</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {cancelledOrders}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-red-600">
              Orders marked as cancelled
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Search size={17} />
            Search & Filter Orders
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search order ID, customer or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option>All Status</option>

                {statusOptions.map((status) => (
                  <option key={status}>{statusLabels[status]}</option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option>All Methods</option>
                <option>Delivery</option>
                <option>Pharmacy Pickup</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Orders Table */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Orders
                </h2>

                <p className="text-sm text-slate-500">
                  {filteredOrders.length} order
                  {filteredOrders.length !== 1 ? "s" : ""} displayed
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={16} />
                Latest orders first
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-emerald-600"
                />
                Loading orders from PostgreSQL...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Items
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const itemCount = order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      );

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <p className="max-w-[150px] break-all font-bold text-slate-900">
                              {order.id}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Pharmacy order
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                <User size={17} />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {order.customerName}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {order.customerEmail}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-slate-700">
                            {itemCount}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-slate-900">
                            {formatCurrency(Number(order.total))}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              {order.deliveryMethod === "DELIVERY" ? (
                                <Truck size={16} />
                              ) : (
                                <ShoppingBag size={16} />
                              )}

                              {methodLabels[order.deliveryMethod]}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                order.status,
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {statusLabels[order.status]}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() => openOrderDetails(order)}
                              disabled={detailsLoading}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <ShoppingBag size={22} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          No orders found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your search or filter options.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-8 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Order Details
                </p>

                <h2 className="mt-1 max-w-xl break-all text-2xl font-bold text-slate-900">
                  {selectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close order details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[80vh] space-y-6 overflow-y-auto p-6">
              {/* Customer */}
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User size={19} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {selectedOrder.customerName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {selectedOrder.customerEmail}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Phone</p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedOrder.customerPhone}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Order Date</p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Order Summary
                </h3>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(Number(item.price))}
                        </p>
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial summary */}
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>

                    <span className="font-semibold text-slate-800">
                      {formatCurrency(Number(selectedOrder.subtotal))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Delivery Fee</span>

                    <span className="font-semibold text-slate-800">
                      {formatCurrency(Number(selectedOrder.deliveryFee))}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Total</span>

                      <span className="text-xl font-bold text-emerald-700">
                        {formatCurrency(Number(selectedOrder.total))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Delivery Method
                  </p>

                  <div className="mt-2 flex items-center gap-2 font-semibold text-slate-800">
                    {selectedOrder.deliveryMethod === "DELIVERY" ? (
                      <Truck size={17} />
                    ) : (
                      <ShoppingBag size={17} />
                    )}

                    {methodLabels[selectedOrder.deliveryMethod]}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Items
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {selectedOrderItemCount} item
                    {selectedOrderItemCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        Delivery Address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-800">
                    Customer Notes
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Current status */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Current Status
                </p>

                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                    selectedOrder.status,
                  )}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {statusLabels[selectedOrder.status]}
                </div>
              </div>

              {/* Status update */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-900">
                  Update Order Status
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This change will be saved directly to the PostgreSQL database.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <select
                      value={selectedStatus}
                      onChange={(event) =>
                        setSelectedStatus(
                          event.target.value as BackendOrderStatus,
                        )
                      }
                      disabled={updatingStatus}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={updateOrderStatus}
                    disabled={
                      updatingStatus || selectedStatus === selectedOrder.status
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {updatingStatus && (
                      <LoaderCircle size={17} className="animate-spin" />
                    )}

                    {updatingStatus ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <CircleCheck size={18} />
                    {successMessage}
                  </div>
                </div>
              )}

              {/* Pharmacy */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Pharmablaze Pharmacy
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setSuccessMessage("");
                    setErrorMessage("");
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
