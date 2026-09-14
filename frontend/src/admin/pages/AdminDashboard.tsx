import {
  Activity,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Database,
  DollarSign,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  Pill,
  RefreshCw,
  Server,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

type DashboardStats = {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
};

type SalesDay = {
  date: string;
  sales: number;
  orders: number;
};

type RecentOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  deliveryMethod: string;
  itemCount: number;
  createdAt: string;
};

type StockAlert = {
  id: string;
  name: string;
  stock: number;
  status: string;
  price: number;
  image?: string | null;
};

type SystemStatus = {
  database: string;
  authentication: string;
  ordersApi: string;
  inventory: string;
};

type DashboardData = {
  stats: DashboardStats;
  salesOverview: SalesDay[];
  recentOrders: RecentOrder[];
  stockAlerts: StockAlert[];
  systemStatus: SystemStatus;
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-NG");

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "CONFIRMED":
    case "PROCESSING":
    case "READY_FOR_PICKUP":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/admin/dashboard");

      setDashboard(response.data.data as DashboardData);
    } catch (err: any) {
      console.error("Admin dashboard error:", err);

      if (err?.response?.status === 401) {
        setError("Your admin session has expired. Please log in again.");
      } else if (err?.response?.status === 403) {
        setError("Admin access is required to view this dashboard.");
      } else {
        setError(
          err?.response?.data?.message || "Unable to load dashboard data.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };

  const chartMaximum = useMemo(() => {
    if (!dashboard?.salesOverview.length) {
      return 1;
    }

    const maximum = Math.max(
      ...dashboard.salesOverview.map((day) => day.sales),
    );

    return maximum > 0 ? maximum : 1;
  }, [dashboard]);

  const total30DaySales = useMemo(() => {
    if (!dashboard) {
      return 0;
    }

    return dashboard.salesOverview.reduce((sum, day) => sum + day.sales, 0);
  }, [dashboard]);

  const total30DayOrders = useMemo(() => {
    if (!dashboard) {
      return 0;
    }

    return dashboard.salesOverview.reduce((sum, day) => sum + day.orders, 0);
  }, [dashboard]);

  const stats = dashboard
    ? [
        {
          label: "Total Sales",
          value: formatCurrency(dashboard.stats.totalSales),
          change: "All non-cancelled orders",
          icon: DollarSign,
        },
        {
          label: "Orders",
          value: formatNumber(dashboard.stats.totalOrders),
          change: "Orders in database",
          icon: ShoppingCart,
        },
        {
          label: "Customers",
          value: formatNumber(dashboard.stats.totalCustomers),
          change: "Registered customers",
          icon: Users,
        },
        {
          label: "Products",
          value: formatNumber(dashboard.stats.totalProducts),
          change: "Products in inventory",
          icon: Package,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit and organize pharmacy products.",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "View Orders",
      description: "Review and manage customer orders.",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      title: "Customers",
      description: "Manage registered customer accounts.",
      icon: Users,
      href: "/admin/customers",
    },
    {
      title: "Prescriptions",
      description: "Review prescription-related requests.",
      icon: FileText,
      href: "/admin/prescriptions",
    },
  ];

  const managementItems = [
    {
      title: "Inventory",
      description: "Monitor stock levels and availability.",
      icon: ClipboardList,
      href: "/admin/inventory",
    },
    {
      title: "Health Articles",
      description: "Manage educational health content.",
      icon: Pill,
      href: "/admin/blog",
    },
    {
      title: "Reviews",
      description: "Review customer feedback.",
      icon: MessageSquare,
      href: "/admin/reviews",
    },
    {
      title: "Settings",
      description: "Configure pharmacy administration settings.",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950">
                <Activity className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Pharmablaze Pharmacy
                </p>

                <h1 className="text-xl font-bold text-slate-950">
                  Admin Dashboard
                </h1>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              {dashboard?.stockAlerts.length ? (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                A
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Administrator
                </p>

                <p className="text-xs text-slate-500">Pharmacy Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
        {/* Welcome */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 shadow-xl lg:px-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: "url('/images/admin-dashboard-background.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur">
              <Activity className="h-4 w-4" />
              Pharmacy Management
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to your admin centre.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Manage Pharmablaze Pharmacy products, inventory, orders,
              customers, prescriptions, reviews, health resources, and
              administrative settings from one central dashboard.
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h3 className="font-bold text-red-800">
                  Dashboard could not be loaded
                </h3>

                <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-10 w-10 animate-spin text-slate-500" />

              <h3 className="mt-4 font-bold text-slate-800">
                Loading dashboard data...
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Connecting to your Pharmablaze database.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {!loading && dashboard && (
          <>
            {/* Stats */}
            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <Icon className="h-5 w-5 text-slate-700" />
                      </div>

                      <ArrowUpRight className="h-5 w-5 text-slate-300" />
                    </div>

                    <p className="mt-6 text-3xl font-bold text-slate-950">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">{stat.change}</p>
                  </div>
                );
              })}
            </section>

            {/* Analytics + System */}
            <section className="mt-8 grid gap-8 xl:grid-cols-[1.7fr_1fr]">
              {/* Sales Overview */}
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Analytics
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      Sales Overview
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Real sales activity from your PostgreSQL database.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700">
                    Last 30 Days
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      30-Day Sales
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {formatCurrency(total30DaySales)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      30-Day Orders
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {formatNumber(total30DayOrders)}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="mt-8">
                  {dashboard.salesOverview.some((day) => day.sales > 0) ? (
                    <div className="overflow-x-auto">
                      <div className="flex h-[280px] min-w-[720px] items-end gap-2 border-b border-slate-200 px-2 pb-0">
                        {dashboard.salesOverview.map((day) => {
                          const height =
                            day.sales === 0
                              ? 4
                              : Math.max(8, (day.sales / chartMaximum) * 230);

                          return (
                            <div
                              key={day.date}
                              className="group flex h-full flex-1 flex-col items-center justify-end"
                            >
                              <div className="relative flex w-full justify-center">
                                <div className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
                                  {formatCurrency(day.sales)}
                                  <br />
                                  {day.orders}{" "}
                                  {day.orders === 1 ? "order" : "orders"}
                                </div>

                                <div
                                  className="w-full max-w-[28px] rounded-t-md bg-slate-800 transition hover:bg-slate-600"
                                  style={{
                                    height: `${height}px`,
                                  }}
                                />
                              </div>

                              <span className="mt-3 text-[10px] text-slate-400">
                                {formatDateShort(day.date)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                      <div className="text-center">
                        <TrendingUp className="mx-auto h-10 w-10 text-slate-300" />

                        <h3 className="mt-4 font-bold text-slate-700">
                          No sales activity in the last 30 days
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                          New orders will automatically appear in this sales
                          overview.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* System Status */}
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  System
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Platform Status
                </h2>

                <div className="mt-7 space-y-4">
                  {[
                    {
                      label: "Database",
                      value: dashboard.systemStatus.database,
                      icon: Database,
                    },
                    {
                      label: "Authentication",
                      value: dashboard.systemStatus.authentication,
                      icon: Users,
                    },
                    {
                      label: "Orders API",
                      value: dashboard.systemStatus.ordersApi,
                      icon: Server,
                    },
                    {
                      label: "Inventory",
                      value: dashboard.systemStatus.inventory,
                      icon: Package,
                    },
                  ].map((system) => {
                    const Icon = system.icon;

                    return (
                      <div
                        key={system.label}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                            <Icon className="h-4 w-4 text-emerald-600" />
                          </span>

                          <span className="text-sm font-semibold text-slate-700">
                            {system.label}
                          </span>
                        </div>

                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          {system.value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <p className="text-sm leading-6 text-emerald-800">
                      Your admin dashboard is connected to the Pharmablaze
                      backend and PostgreSQL database.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Management
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Quick Actions
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.title}
                      to={action.href}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <Icon className="h-6 w-6 text-slate-700" />
                        </div>

                        <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                      </div>

                      <h3 className="mt-5 font-bold text-slate-950">
                        {action.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {action.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Activity
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      Recent Orders
                    </h2>
                  </div>

                  <Clock3 className="h-6 w-6 text-slate-300" />
                </div>

                <div className="mt-7 space-y-3">
                  {dashboard.recentOrders.length > 0 ? (
                    dashboard.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">
                              {order.customerName}
                            </h3>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {order.customerEmail}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusClasses(
                              order.status,
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-950">
                              {formatCurrency(order.total)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {order.itemCount}{" "}
                              {order.itemCount === 1 ? "item" : "items"} ·{" "}
                              {order.deliveryMethod === "DELIVERY"
                                ? "Delivery"
                                : "Pickup"}
                            </p>
                          </div>

                          <p className="text-xs text-slate-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center">
                      <ShoppingCart className="mx-auto h-9 w-9 text-slate-300" />

                      <h3 className="mt-4 font-bold text-slate-700">
                        No orders yet
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Customer orders will appear here automatically.
                      </p>
                    </div>
                  )}
                </div>

                {dashboard.recentOrders.length > 0 && (
                  <Link
                    to="/admin/orders"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950"
                  >
                    View all orders
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* Stock Alerts */}
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Inventory
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      Stock Alerts
                    </h2>
                  </div>

                  <Package className="h-6 w-6 text-slate-300" />
                </div>

                <div className="mt-7 space-y-3">
                  {dashboard.stockAlerts.length > 0 ? (
                    dashboard.stockAlerts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <Package className="h-5 w-5 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-bold ${
                              product.stock === 0
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {product.stock === 0
                              ? "Out of stock"
                              : `${product.stock} left`}
                          </p>

                          <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                            {formatStatus(product.status)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center">
                      <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />

                      <h3 className="mt-4 font-bold text-slate-700">
                        Inventory looks healthy
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        No products are currently at or below the low-stock
                        threshold.
                      </p>
                    </div>
                  )}
                </div>

                {dashboard.stockAlerts.length > 0 && (
                  <Link
                    to="/admin/inventory"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950"
                  >
                    Manage inventory
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </section>

            {/* Management Centre */}
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Administration
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Management Centre
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Core administration areas for the Pharmablaze platform.
                </p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {managementItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="group rounded-2xl border border-slate-200 p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-slate-600" />

                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-700" />
                      </div>

                      <h3 className="mt-5 text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-7 pb-4">
          <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Pharmablaze Pharmacy. Admin Centre.
            </p>

            <p>235 Abak Rd, Uyo, Akwa Ibom</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
