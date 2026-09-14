import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react";
import api from "../services/api";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: "Active" | "Inactive" | string;
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

const formatCurrency = (amount: number | string) => {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "processing":
      return "bg-purple-100 text-purple-700";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetails | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/customers");

      setCustomers(response.data.data || []);
    } catch (err: any) {
      console.error("Failed to fetch customers:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
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
      setLoadingCustomer(true);
      setCustomerError("");
      setSelectedCustomer(null);

      const response = await api.get(`/customers/${customerId}`);

      setSelectedCustomer(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch customer details:", err);

      if (err.response?.status === 404) {
        setCustomerError("Customer not found.");
      } else if (err.response?.status === 401) {
        setCustomerError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setCustomerError("Admin access is required.");
      } else {
        setCustomerError(
          err.response?.data?.message || "Failed to load customer details.",
        );
      }
    } finally {
      setLoadingCustomer(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive",
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpent),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Customers
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and view your registered customers
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-medium">Unable to load customers</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchCustomers}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Customers
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalCustomers}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Customers
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {activeCustomers}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive Customers
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {inactiveCustomers}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Customer Spend
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search / Filter */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Customer List</h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />

                <p className="mt-3 text-sm text-gray-500">
                  Loading customers...
                </p>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center px-6">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-gray-300" />

                <h3 className="mt-4 font-semibold text-gray-900">
                  No customers found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {customers.length === 0
                    ? "There are currently no registered customers."
                    : "Try adjusting your search or status filter."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Orders</th>
                    <th className="px-5 py-4">Total Spent</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {customer.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              ID: {customer.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {customer.email}
                          </div>

                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {customer.orders}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            customer.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(customer.joined)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewCustomer(customer.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {(loadingCustomer || customerError || selectedCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Customer Details
                </h2>

                <p className="text-sm text-gray-500">
                  Real customer information from PostgreSQL
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerError("");
                  setLoadingCustomer(false);
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-5 sm:p-6">
              {loadingCustomer ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading customer details...
                    </p>
                  </div>
                </div>
              ) : customerError ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

                    <h3 className="mt-3 font-semibold text-gray-900">
                      Unable to load customer
                    </h3>

                    <p className="mt-1 text-sm text-red-600">{customerError}</p>
                  </div>
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-6">
                  {/* Profile */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                        {selectedCustomer.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {selectedCustomer.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              selectedCustomer.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {selectedCustomer.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          Customer ID: {selectedCustomer.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-900">
                          {selectedCustomer.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Phone
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCustomer.phone || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Joined
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                          {formatDateTime(selectedCustomer.joined)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Location
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCustomer.location || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Total Orders</p>

                          <p className="text-xl font-bold text-gray-900">
                            {selectedCustomer.orders}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                          <span className="font-bold text-green-600">₦</span>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Total Spent</p>

                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(selectedCustomer.totalSpent)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Account Status
                          </p>

                          <p className="text-xl font-bold text-gray-900">
                            {selectedCustomer.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order History
                      </h3>

                      <p className="text-sm text-gray-500">
                        Orders placed by this customer
                      </p>
                    </div>

                    {selectedCustomer.orderHistory.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                        <ShoppingBag className="mx-auto h-10 w-10 text-gray-300" />

                        <p className="mt-3 font-medium text-gray-700">
                          No orders yet
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          This customer has not placed an order.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedCustomer.orderHistory.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-gray-200 bg-white p-4"
                          >
                            <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Order #{order.id}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {formatDateTime(order.createdAt)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(
                                    order.status,
                                  )}`}
                                >
                                  {order.status}
                                </span>

                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                  {order.deliveryMethod}
                                </span>

                                <span className="font-bold text-gray-900">
                                  {formatCurrency(order.total)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-800">
                                      {item.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-semibold text-gray-900">
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
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
