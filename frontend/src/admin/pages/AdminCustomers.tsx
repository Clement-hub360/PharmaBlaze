import {
  AlertCircle,
  CalendarDays,
  CircleCheck,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../../services/api";

type CustomerStatus = "Active" | "Inactive";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: CustomerStatus;
  joined: string;
  location?: string;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number | string;
};

type CustomerOrder = {
  id: string;
  total: number | string;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  items: OrderItem[];
};

type CustomerDetails = Customer & {
  orderHistory: CustomerOrder[];
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "confirmed":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "processing":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "ready_for_pickup":
    case "ready for pickup":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "out_for_delivery":
    case "out for delivery":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "cancelled":
    case "canceled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetails | null>(null);

  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState("");

  const [updatingCustomerId, setUpdatingCustomerId] = useState<string | null>(
    null,
  );

  const fetchCustomers = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/customers");

      setCustomers(response.data.data || []);
    } catch (err: any) {
      console.error("Failed to fetch customers:", err);

      if (err.response?.status === 401) {
        setError("Your admin session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Admin access is required to view customers.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load customers. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
  };

  const handleViewCustomer = async (customerId: string) => {
    try {
      setSelectedCustomer(null);
      setCustomerError("");
      setLoadingCustomer(true);

      const response = await api.get(`/customers/${customerId}`);

      setSelectedCustomer(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch customer details:", err);

      if (err.response?.status === 401) {
        setCustomerError("Your admin session has expired.");
      } else if (err.response?.status === 403) {
        setCustomerError("Admin access is required.");
      } else if (err.response?.status === 404) {
        setCustomerError("Customer not found.");
      } else {
        setCustomerError(
          err.response?.data?.message || "Failed to load customer details.",
        );
      }
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleCustomerStatusChange = async (
    customerId: string,
    active: boolean,
  ) => {
    try {
      setUpdatingCustomerId(customerId);
      setError("");

      await api.patch(`/customers/${customerId}/status`, {
        active,
      });

      await fetchCustomers();

      if (selectedCustomer?.id === customerId) {
        const response = await api.get(`/customers/${customerId}`);

        setSelectedCustomer(response.data.data);
      }
    } catch (err: any) {
      console.error("Failed to update customer status:", err);

      if (err.response?.status === 401) {
        setError("Your admin session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Admin access is required.");
      } else if (err.response?.status === 404) {
        setError("Customer not found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to update customer status. Please try again.",
        );
      }
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.id.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All Status" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive",
  ).length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + Number(customer.orders),
    0,
  );

  const totalCustomerSpend = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpent),
    0,
  );

  const closeCustomerModal = () => {
    setSelectedCustomer(null);
    setCustomerError("");
    setLoadingCustomer(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Users size={17} />
                Customer Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Customers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage customer records, review purchasing activity, and keep
                track of your pharmacy customer base.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Customer Spending
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {formatCurrency(totalCustomerSpend)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <div className="flex-1">
              <p className="font-semibold">Unable to process request</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchCustomers}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
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
                  Total Customers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {customers.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Users size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Registered customer accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Customers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {activeCustomers}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CircleCheck size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-emerald-600">
              Accounts currently active
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalOrders}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <ShoppingBag size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-purple-600">
              Orders across customers
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Customers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {inactiveCustomers}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-red-600">
              Accounts currently inactive
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Search size={17} />
            Search & Filter Customers
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, phone or customer ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </section>

      {/* Customer Directory */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Directory
                </h2>

                <p className="text-sm text-slate-500">
                  {filteredCustomers.length} customer
                  {filteredCustomers.length !== 1 ? "s" : ""} displayed
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={16} />
                Live customer records
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={32}
                  className="mx-auto animate-spin text-emerald-600"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Loading customers from the database...
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total Spent
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                              <User size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {customer.name}
                              </p>

                              <p className="mt-1 max-w-[250px] truncate text-xs text-slate-400">
                                {customer.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail size={14} />
                              {customer.email}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Phone size={13} />
                              {customer.phone || "Not provided"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-bold text-slate-900">
                            {customer.orders}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-slate-900">
                          {formatCurrency(customer.totalSpent)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              customer.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {customer.status === "Active" ? (
                              <CircleCheck size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}

                            {customer.status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(customer.joined)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewCustomer(customer.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            {customer.status === "Active" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCustomerStatusChange(customer.id, false)
                                }
                                disabled={updatingCustomerId === customer.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updatingCustomerId === customer.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <XCircle size={14} />
                                )}

                                {updatingCustomerId === customer.id
                                  ? "Updating..."
                                  : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCustomerStatusChange(customer.id, true)
                                }
                                disabled={updatingCustomerId === customer.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updatingCustomerId === customer.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CircleCheck size={14} />
                                )}

                                {updatingCustomerId === customer.id
                                  ? "Updating..."
                                  : "Activate"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Users size={22} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          No customers found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {customers.length === 0
                            ? "There are currently no registered customer accounts."
                            : "Try changing your search or status filter."}
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

      {/* Customer Details Modal */}
      {(loadingCustomer || customerError || selectedCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Customer Profile
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedCustomer?.name || "Customer Details"}
                </h2>

                {selectedCustomer && (
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedCustomer.id}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeCustomerModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close customer profile"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
              {loadingCustomer ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <RefreshCw
                      size={32}
                      className="mx-auto animate-spin text-emerald-600"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      Loading customer details...
                    </p>
                  </div>
                </div>
              ) : customerError ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <div className="text-center">
                    <AlertCircle size={42} className="mx-auto text-red-500" />

                    <h3 className="mt-4 font-semibold text-slate-900">
                      Unable to load customer
                    </h3>

                    <p className="mt-1 text-sm text-red-600">{customerError}</p>
                  </div>
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-6">
                  {/* Profile */}
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <User size={27} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900">
                            {selectedCustomer.name}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              selectedCustomer.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {selectedCustomer.status === "Active" ? (
                              <CircleCheck size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}

                            {selectedCustomer.status}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={14} />
                          {selectedCustomer.location || "Location not provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status Actions */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Account Status
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Control whether this customer account is active.
                        </p>
                      </div>

                      {selectedCustomer.status === "Active" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomerStatusChange(
                              selectedCustomer.id,
                              false,
                            )
                          }
                          disabled={updatingCustomerId === selectedCustomer.id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingCustomerId === selectedCustomer.id ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}

                          {updatingCustomerId === selectedCustomer.id
                            ? "Updating..."
                            : "Deactivate Account"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomerStatusChange(
                              selectedCustomer.id,
                              true,
                            )
                          }
                          disabled={updatingCustomerId === selectedCustomer.id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingCustomerId === selectedCustomer.id ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CircleCheck size={16} />
                          )}

                          {updatingCustomerId === selectedCustomer.id
                            ? "Updating..."
                            : "Activate Account"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                      Contact Information
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail size={14} />
                          Email
                        </div>

                        <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                          {selectedCustomer.email}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Phone size={14} />
                          Phone
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {selectedCustomer.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-400">Orders</p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {selectedCustomer.orders}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-400">Total Spent</p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatCurrency(selectedCustomer.totalSpent)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-400">Joined</p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatDateTime(selectedCustomer.joined)}
                      </p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        Order History
                      </h3>

                      <p className="text-sm text-slate-500">
                        Real orders associated with this customer account.
                      </p>
                    </div>

                    {selectedCustomer.orderHistory.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <ShoppingBag
                          size={36}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                          No orders yet
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          This customer has not placed any orders.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedCustomer.orderHistory.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-2xl border border-slate-200 p-4"
                          >
                            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Order #{order.id}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDateTime(order.createdAt)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getOrderStatusClasses(
                                    order.status,
                                  )}`}
                                >
                                  {order.status}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                  {order.deliveryMethod}
                                </span>

                                <span className="font-bold text-slate-900">
                                  {formatCurrency(order.total)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                      {item.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-bold text-slate-900">
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={closeCustomerModal}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
