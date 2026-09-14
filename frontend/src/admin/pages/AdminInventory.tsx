import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  CheckCircle2,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId: string;
  stock: number;
  reorderLevel: number;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  productStatus: string;
  lastUpdated: string;
  createdAt: string;
};

type InventorySummary = {
  totalProducts: number;
  totalStockUnits: number;
  inventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
};

type InventoryResponse = {
  success: boolean;
  message: string;
  data: {
    items: InventoryItem[];
    summary: InventorySummary;
  };
};

type StockAction = "in" | "adjustment";

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalProducts: 0,
    totalStockUnits: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [stockMessage, setStockMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAction, setStockAction] = useState<StockAction>("in");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState("");
  const [stockUpdating, setStockUpdating] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value);

  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadInventory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get<InventoryResponse>("/inventory");

      setInventory(response.data.data.items);
      setSummary(response.data.data.summary);
    } catch (err: any) {
      console.error("Load inventory error:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to load inventory. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(inventory.map((item) => item.category)),
    );

    return ["All", ...uniqueCategories];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const filtered = inventory.filter((item) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "stock-low":
          return a.stock - b.stock;

        case "stock-high":
          return b.stock - a.stock;

        case "value-high":
          return b.stock * b.price - a.stock * a.price;

        case "updated":
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );

        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter, sortBy]);

  const selectedProduct = useMemo(
    () => inventory.find((item) => item.id === selectedProductId) ?? null,
    [inventory, selectedProductId],
  );

  const openStockModal = (productId: string, action: StockAction) => {
    setSelectedProductId(productId);
    setStockAction(action);
    setQuantity("");
    setStockMessage("");
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    if (stockUpdating) return;

    setIsStockModalOpen(false);
    setSelectedProductId(null);
    setQuantity("");
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct) {
      setStockMessage("Please select a product.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setStockMessage("Please enter a valid whole number greater than zero.");
      return;
    }

    const quantityDelta =
      stockAction === "in" ? parsedQuantity : -parsedQuantity;

    if (
      stockAction === "adjustment" &&
      parsedQuantity > selectedProduct.stock
    ) {
      setStockMessage(
        `You cannot remove ${parsedQuantity} units because only ${selectedProduct.stock} are currently in stock.`,
      );
      return;
    }

    try {
      setStockUpdating(true);
      setStockMessage("");

      const response = await api.patch(
        `/inventory/${selectedProduct.id}/stock`,
        {
          quantityDelta,
        },
      );

      setStockMessage(response.data?.message || "Stock updated successfully.");

      /*
       * Reload the inventory from PostgreSQL after the update.
       * This keeps the UI synchronized with the real database
       * instead of manually guessing the updated response shape.
       */
      await loadInventory(true);

      setIsStockModalOpen(false);
      setSelectedProductId(null);
      setQuantity("");
    } catch (err: any) {
      console.error("Stock update error:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to update stock. Please try again.";

      setStockMessage(message);
    } finally {
      setStockUpdating(false);
    }
  };

  const getStatusClasses = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return "bg-green-50 text-green-700 border-green-200";

      case "Low Stock":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "Out of Stock":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return <CheckCircle2 size={14} />;

      case "Low Stock":
        return <AlertTriangle size={14} />;

      case "Out of Stock":
        return <X size={14} />;

      default:
        return null;
    }
  };

  const getStockBarWidth = (item: InventoryItem) => {
    if (item.stock <= 0) {
      return 0;
    }

    const referenceLevel = Math.max(item.reorderLevel * 3, 30);

    return Math.min((item.stock / referenceLevel) * 100, 100);
  };

  const getStockBarClasses = (status: InventoryItem["status"]) => {
    switch (status) {
      case "Out of Stock":
        return "bg-red-500";

      case "Low Stock":
        return "bg-yellow-500";

      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Boxes size={17} />
              <span>Admin</span>
              <span>/</span>
              <span>Inventory</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Inventory Management
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Monitor stock levels and manage product inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadInventory(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Success Message */}
        {stockMessage && !isStockModalOpen && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            <span>{stockMessage}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={19} />
              <span className="text-sm">{error}</span>
            </div>

            <button
              type="button"
              onClick={() => void loadInventory()}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Package size={21} />
              </div>

              <span className="text-xs font-medium text-gray-500">
                Products
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-gray-900">
              {summary.totalProducts}
            </p>

            <p className="mt-1 text-sm text-gray-500">Total products</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <Boxes size={21} />
              </div>

              <span className="text-xs font-medium text-gray-500">Units</span>
            </div>

            <p className="mt-4 text-2xl font-bold text-gray-900">
              {summary.totalStockUnits.toLocaleString()}
            </p>

            <p className="mt-1 text-sm text-gray-500">Total stock units</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <TrendingUp size={21} />
              </div>

              <span className="text-xs font-medium text-gray-500">Value</span>
            </div>

            <p className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
              {formatCurrency(summary.inventoryValue)}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Current inventory value
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                <TrendingDown size={21} />
              </div>

              <span className="text-xs font-medium text-gray-500">
                Attention
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-gray-900">
              {summary.lowStockItems}
            </p>

            <p className="mt-1 text-sm text-gray-500">Low stock items</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <AlertTriangle size={21} />
              </div>

              <span className="text-xs font-medium text-gray-500">
                Critical
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-gray-900">
              {summary.outOfStockItems}
            </p>

            <p className="mt-1 text-sm text-gray-500">Out of stock</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Inventory Filters</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search product or SKU..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="name">Sort: Name</option>
              <option value="stock-low">Sort: Lowest Stock</option>
              <option value="stock-high">Sort: Highest Stock</option>
              <option value="value-high">Sort: Highest Value</option>
              <option value="updated">Sort: Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Inventory</h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredInventory.length} of {inventory.length}{" "}
                products
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Boxes size={16} />
              Live database inventory
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <RefreshCw size={19} className="animate-spin" />
                Loading inventory...
              </div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-gray-100 p-4 text-gray-500">
                <Package size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No inventory found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                Try changing your search or filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Product
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Reorder Level
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Updated
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="transition hover:bg-gray-50">
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <div className="w-32">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              {item.stock}
                            </span>

                            <span className="text-xs text-gray-400">units</span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all ${getStockBarClasses(
                                item.status,
                              )}`}
                              style={{
                                width: `${getStockBarWidth(item)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Reorder Level */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">
                          {item.reorderLevel}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            item.status,
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(item.lastUpdated)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openStockModal(item.id, "in")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            <ArrowUp size={14} />
                            Stock In
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openStockModal(item.id, "adjustment")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <ArrowDown size={14} />
                            Adjustment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attention Panel */}
        {(summary.lowStockItems > 0 || summary.outOfStockItems > 0) && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2.5 text-yellow-600 shadow-sm">
                <AlertTriangle size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Inventory attention required
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {summary.lowStockItems > 0 &&
                    `${summary.lowStockItems} item${
                      summary.lowStockItems === 1 ? "" : "s"
                    } ${
                      summary.lowStockItems === 1 ? "is" : "are"
                    } below the reorder level.`}

                  {summary.lowStockItems > 0 &&
                    summary.outOfStockItems > 0 &&
                    " "}

                  {summary.outOfStockItems > 0 &&
                    `${summary.outOfStockItems} item${
                      summary.outOfStockItems === 1 ? "" : "s"
                    } ${
                      summary.outOfStockItems === 1 ? "is" : "are"
                    } currently out of stock.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stock Modal */}
        {isStockModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {stockAction === "in" ? "Add Stock" : "Stock Adjustment"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedProduct.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockUpdating}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Current Stock</p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {selectedProduct.stock}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Reorder Level</p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {selectedProduct.reorderLevel}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock-action"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Action
                  </label>

                  <select
                    id="stock-action"
                    value={stockAction}
                    onChange={(event) =>
                      setStockAction(event.target.value as StockAction)
                    }
                    disabled={stockUpdating}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="in">Stock In — Add Units</option>

                    <option value="adjustment">
                      Stock Adjustment — Remove Units
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="stock-quantity"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Quantity
                  </label>

                  <input
                    id="stock-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    disabled={stockUpdating}
                    placeholder="Enter quantity"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {quantity &&
                  Number.isInteger(Number(quantity)) &&
                  Number(quantity) > 0 && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm text-blue-700">New stock level:</p>

                      <p className="mt-1 text-2xl font-bold text-blue-900">
                        {Math.max(
                          0,
                          selectedProduct.stock +
                            (stockAction === "in"
                              ? Number(quantity)
                              : -Number(quantity)),
                        )}
                      </p>
                    </div>
                  )}

                {stockMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {stockMessage}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockUpdating}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleStockUpdate()}
                  disabled={stockUpdating || !quantity || Number(quantity) <= 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {stockUpdating && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}

                  {stockUpdating
                    ? "Updating..."
                    : stockAction === "in"
                      ? "Add Stock"
                      : "Adjust Stock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
