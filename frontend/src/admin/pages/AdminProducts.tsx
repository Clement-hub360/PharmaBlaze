import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Edit3,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Download,
  Pill,
  Sparkles,
  HeartPulse,
  Stethoscope,
  X,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  categoryId: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  featured: boolean;
  status: ProductStatus;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  active?: boolean;
};

type ProductForm = {
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  stock: string;
  description: string;
  image: string;
  rating: string;
  featured: boolean;
  status: ProductStatus;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const emptyProductForm: ProductForm = {
  name: "",
  sku: "",
  categoryId: "",
  price: "",
  stock: "",
  description: "",
  image: "",
  rating: "0",
  featured: false,
  status: "ACTIVE",
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [showFilters, setShowFilters] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState<ProductForm>(emptyProductForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /*
   * IMPORTANT:
   * LOW_STOCK is only a UI/display condition.
   * The database ProductStatus only supports:
   * ACTIVE | INACTIVE | OUT_OF_STOCK
   */
  const getStatus = (
    stock: number,
    productStatus?: ProductStatus,
  ): ProductStatus => {
    if (productStatus === "INACTIVE") {
      return "INACTIVE";
    }

    if (stock <= 0) {
      return "OUT_OF_STOCK";
    }

    return "ACTIVE";
  };

  const getDisplayStatus = (product: Product) => {
    if (product.status === "INACTIVE") {
      return "Inactive";
    }

    if (product.stock <= 0 || product.status === "OUT_OF_STOCK") {
      return "Out of Stock";
    }

    if (product.stock <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const getStatusClasses = (product: Product) => {
    const status = getDisplayStatus(product);

    if (status === "In Stock") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "Low Stock") {
      return "bg-amber-50 text-amber-700";
    }

    if (status === "Inactive") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-red-50 text-red-700";
  };

  const getCategoryDisplayName = (name: string) => {
    if (name === "Pharmacy Products") {
      return "Medicines";
    }

    return name;
  };

  const createSlug = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const mapProduct = (product: any): Product => {
    const categoryName =
      product.category?.name || product.categoryName || "Pharmacy Products";

    const stock = Number(product.stock ?? 0);

    return {
      id: String(product.id),
      name: product.name ?? "",
      slug: product.slug ?? createSlug(product.name ?? ""),
      description: product.description ?? "",
      sku: product.sku ?? "",
      categoryId: product.categoryId || product.category?.id || "",
      category: getCategoryDisplayName(categoryName),
      price: Number(product.price ?? 0),
      stock,
      rating: Number(product.rating ?? 0),
      featured: Boolean(product.featured),
      status: getStatus(stock, product.status as ProductStatus),
      image: product.image?.trim() || "/images/product-placeholder.jpg",
      createdAt: product.createdAt ?? "",
      updatedAt: product.updatedAt ?? "",
    };
  };

  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get<ApiResponse<any[]>>("/products");

      const data = Array.isArray(response.data.data) ? response.data.data : [];

      setProducts(data.map(mapProduct));
    } catch (err: any) {
      console.error("Load products error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load products. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get<ApiResponse<any[]>>("/categories");

      const data = Array.isArray(response.data.data) ? response.data.data : [];

      setCategories(
        data
          .filter((category) => category.active !== false)
          .map((category) => ({
            id: String(category.id),
            name: category.name ?? "",
            slug: category.slug ?? "",
            description: category.description,
            image: category.image,
            active: category.active,
          })),
      );
    } catch (err) {
      console.error("Load categories error:", err);
    }
  };

  const loadData = async (isRefresh = false) => {
    await Promise.all([loadProducts(isRefresh), loadCategories()]);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const categoryOptions = useMemo(() => {
    return [
      {
        id: "all",
        name: "All Categories",
      },
      ...categories.map((category) => ({
        id: category.id,
        name: getCategoryDisplayName(category.name),
      })),
    ];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        product.category === categoryFilter;

      const displayStatus = getDisplayStatus(product);

      const matchesStatus =
        statusFilter === "All Statuses" || displayStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const totalProducts = products.length;

  const inStockProducts = products.filter(
    (product) => getDisplayStatus(product) === "In Stock",
  ).length;

  const lowStockProducts = products.filter(
    (product) => getDisplayStatus(product) === "Low Stock",
  ).length;

  const outOfStockProducts = products.filter(
    (product) => getDisplayStatus(product) === "Out of Stock",
  ).length;

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Statuses");
  };

  const resetMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const openAddForm = () => {
    resetMessages();

    setNewProduct({
      ...emptyProductForm,
      categoryId: categories[0]?.id ?? "",
    });

    setShowAddForm(true);
  };

  const closeAddForm = () => {
    if (saving) return;

    setShowAddForm(false);
    setNewProduct(emptyProductForm);
  };

  const handleAddProduct = async () => {
    resetMessages();

    const name = newProduct.name.trim();
    const sku = newProduct.sku.trim().toUpperCase();
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
    const rating = Number(newProduct.rating || 0);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!sku) {
      setError("SKU is required.");
      return;
    }

    if (!newProduct.categoryId) {
      setError("Please select a product category.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock quantity must be a whole number of 0 or more.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    try {
      setSaving(true);

      const slug = createSlug(name);

      const status: ProductStatus =
        newProduct.status === "INACTIVE"
          ? "INACTIVE"
          : stock === 0
            ? "OUT_OF_STOCK"
            : "ACTIVE";

      const payload = {
        name,
        slug,
        description:
          newProduct.description.trim() ||
          `${name} available from Pharmablaze Pharmacy.`,
        sku,
        price,
        stock,
        image: newProduct.image.trim() || undefined,
        rating,
        featured: newProduct.featured,
        status,
        categoryId: newProduct.categoryId,
      };

      const response = await api.post<ApiResponse<any>>("/products", payload);

      const createdProduct = response.data.data;

      if (createdProduct) {
        setProducts((current) => [mapProduct(createdProduct), ...current]);
      } else {
        await loadProducts(true);
      }

      setSuccessMessage(
        response.data.message || "Product created successfully.",
      );

      setNewProduct(emptyProductForm);
      setShowAddForm(false);
    } catch (err: any) {
      console.error("Create product error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditForm = (product: Product) => {
    resetMessages();

    setEditingProduct({
      ...product,
    });
  };

  const closeEditForm = () => {
    if (saving) return;

    setEditingProduct(null);
  };

  const handleEditSave = async () => {
    if (!editingProduct) return;

    resetMessages();

    const name = editingProduct.name.trim();
    const sku = editingProduct.sku.trim().toUpperCase();
    const price = Number(editingProduct.price);
    const stock = Number(editingProduct.stock);
    const rating = Number(editingProduct.rating ?? 0);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!sku) {
      setError("SKU is required.");
      return;
    }

    if (!editingProduct.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock quantity must be a whole number of 0 or more.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    try {
      setSaving(true);

      const status: ProductStatus =
        editingProduct.status === "INACTIVE"
          ? "INACTIVE"
          : stock === 0
            ? "OUT_OF_STOCK"
            : "ACTIVE";

      const payload = {
        name,
        slug: editingProduct.slug || createSlug(name),
        description:
          editingProduct.description.trim() ||
          `${name} available from Pharmablaze Pharmacy.`,
        sku,
        price,
        stock,
        image: editingProduct.image.trim() || undefined,
        rating,
        featured: editingProduct.featured,
        status,
        categoryId: editingProduct.categoryId,
      };

      const response = await api.patch<ApiResponse<any>>(
        `/products/${editingProduct.id}`,
        payload,
      );

      const updatedProduct = response.data.data;

      if (updatedProduct) {
        const mapped = mapProduct(updatedProduct);

        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id ? mapped : product,
          ),
        );
      } else {
        await loadProducts(true);
      }

      setSuccessMessage(
        response.data.message || "Product updated successfully.",
      );

      setEditingProduct(null);
    } catch (err: any) {
      console.error("Update product error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action will remove the product from the database.`,
    );

    if (!confirmed) return;

    resetMessages();

    try {
      setDeletingId(id);

      const response = await api.delete<ApiResponse<any>>(`/products/${id}`);

      setProducts((current) => current.filter((item) => item.id !== id));

      setSuccessMessage(
        response.data.message || "Product deleted successfully.",
      );

      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }

      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
    } catch (err: any) {
      console.error("Delete product error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete product. The product may be linked to existing orders or cart items.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (products.length === 0) {
      setError("There are no products to export.");
      return;
    }

    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Price",
      "Stock",
      "Status",
      "Rating",
      "Featured",
    ];

    const rows = products.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.price,
      product.stock,
      getDisplayStatus(product),
      product.rating,
      product.featured ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "pharmablaze-products.csv";
    link.click();

    URL.revokeObjectURL(url);

    setSuccessMessage("Product catalogue exported successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
              <Package className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Pharmablaze Pharmacy
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Products Management
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 shadow-xl lg:px-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: "url('/images/admin-products-background.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur">
              <Pill className="h-4 w-4" />
              Inventory Catalogue
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Manage your pharmacy products.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Add, organize, review, and maintain your pharmacy catalogue from
              one central administration area. Product changes are saved
              directly to the Pharmablaze database.
            </p>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="shrink-0 rounded-lg p-1 hover:bg-emerald-100"
              aria-label="Close success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Package className="h-5 w-5 text-slate-700" />
              </div>

              <span className="text-xs font-bold text-slate-400">
                Catalogue
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {totalProducts}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Total Products
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>

              <span className="text-xs font-bold text-slate-400">
                Available
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {inStockProducts}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              In Stock
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <AlertTriangle className="h-5 w-5 text-slate-700" />
              </div>

              <span className="text-xs font-bold text-slate-400">
                Attention
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {lowStockProducts}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Low Stock
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <XCircle className="h-5 w-5 text-slate-700" />
              </div>

              <span className="text-xs font-bold text-slate-400">
                Unavailable
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {outOfStockProducts}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Out of Stock
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void loadData(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-bold transition ${
                  showFilters
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category-filter"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Stock Status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option>All Statuses</option>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
                >
                  <X className="h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Catalogue
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Pharmacy Products
              </h2>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Loading products from database...
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Price
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Stock
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                              <img
                                src={product.image}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            </div>

                            <div>
                              <p className="font-bold text-slate-950">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {product.sku}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {product.category}
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-slate-950">
                          {formatPrice(product.price)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-700">
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                              product,
                            )}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                getDisplayStatus(product) === "In Stock"
                                  ? "bg-emerald-500"
                                  : getDisplayStatus(product) === "Low Stock"
                                    ? "bg-amber-500"
                                    : getDisplayStatus(product) === "Inactive"
                                      ? "bg-slate-400"
                                      : "bg-red-500"
                              }`}
                            />

                            {getDisplayStatus(product)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                              aria-label={`View ${product.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Delete ${product.name}`}
                            >
                              {deletingId === product.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-5">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-950">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              {product.sku}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="text-slate-400"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {product.category}
                          </span>

                          <span className="text-sm font-bold text-slate-950">
                            {formatPrice(product.price)}
                          </span>

                          <span className="text-xs font-semibold text-slate-500">
                            Stock: {product.stock}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                              product,
                            )}`}
                          >
                            {getDisplayStatus(product)}
                          </span>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200"
                              aria-label={`View ${product.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-red-500 disabled:opacity-50"
                              aria-label={`Delete ${product.name}`}
                            >
                              {deletingId === product.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="p-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-bold text-slate-700">
                    No products found
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Try changing your search or filter settings.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Sparkles className="h-5 w-5 text-slate-700" />
            </div>

            <h3 className="mt-5 font-bold text-slate-950">Product Catalogue</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Product names, categories, prices, SKUs, descriptions, and
              availability are now managed through the database.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <HeartPulse className="h-5 w-5 text-slate-700" />
            </div>

            <h3 className="mt-5 font-bold text-slate-950">Stock Awareness</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Products with limited or unavailable stock are surfaced
              automatically from the current inventory quantities.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Stethoscope className="h-5 w-5 text-slate-700" />
            </div>

            <h3 className="mt-5 font-bold text-slate-950">Pharmacy Review</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Authorized administrators can review and maintain the pharmacy
              catalogue through the protected admin area.
            </p>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-7">
          <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Pharmablaze Pharmacy. Admin Centre.
            </p>

            <p>235 Abak Rd, Uyo, Akwa Ibom</p>
          </div>
        </footer>
      </main>

      {/* ADD PRODUCT MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Catalogue
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Add New Product
                </h2>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="product-sku"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  SKU
                </label>

                <input
                  id="product-sku"
                  type="text"
                  value={newProduct.sku}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      sku: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="PBL-005"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="product-category"
                  value={newProduct.categoryId}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      categoryId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryDisplayName(category.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-price"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Price (₦)
                </label>

                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      price: event.target.value,
                    })
                  }
                  placeholder="4500"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="product-stock"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Stock Quantity
                </label>

                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.stock}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      stock: event.target.value,
                    })
                  }
                  placeholder="20"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="product-description"
                  rows={4}
                  value={newProduct.description}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      description: event.target.value,
                    })
                  }
                  placeholder="Enter a clear product description..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="product-image"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Product Image Path
                </label>

                <input
                  id="product-image"
                  type="text"
                  value={newProduct.image}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      image: event.target.value,
                    })
                  }
                  placeholder="/images/product-5.jpg"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Optional. You can add the image path from your VS Code
                  public/images folder.
                </p>
              </div>

              <div>
                <label
                  htmlFor="product-rating"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Rating
                </label>

                <input
                  id="product-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newProduct.rating}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      rating: event.target.value,
                    })
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="product-status"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Product Status
                </label>

                <select
                  id="product-status"
                  value={newProduct.status}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      status: event.target.value as ProductStatus,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="ACTIVE">Active</option>

                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      featured: event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span>
                  <span className="block text-sm font-bold text-slate-700">
                    Featured Product
                  </span>

                  <span className="block text-xs text-slate-400">
                    Display this product in featured product sections.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAddForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleAddProduct()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <RefreshCw className="h-4 w-4 animate-spin" />}

                {saving ? "Saving..." : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Catalogue
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Edit Product
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-product-name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Product Name
                </label>

                <input
                  id="edit-product-name"
                  type="text"
                  value={editingProduct.name}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-sku"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  SKU
                </label>

                <input
                  id="edit-product-sku"
                  type="text"
                  value={editingProduct.sku}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      sku: event.target.value.toUpperCase(),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-category"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="edit-product-category"
                  value={editingProduct.categoryId}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      categoryId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryDisplayName(category.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-product-price"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Price (₦)
                </label>

                <input
                  id="edit-product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-stock"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Stock Quantity
                </label>

                <input
                  id="edit-product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={editingProduct.stock}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-product-description"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="edit-product-description"
                  rows={4}
                  value={editingProduct.description}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: event.target.value,
                    })
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-product-image"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Product Image Path
                </label>

                <input
                  id="edit-product-image"
                  type="text"
                  value={editingProduct.image}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      image: event.target.value,
                    })
                  }
                  placeholder="/images/product-1.jpg"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-rating"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Rating
                </label>

                <input
                  id="edit-product-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editingProduct.rating}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      rating: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-status"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Product Status
                </label>

                <select
                  id="edit-product-status"
                  value={
                    editingProduct.status === "OUT_OF_STOCK"
                      ? "ACTIVE"
                      : editingProduct.status
                  }
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      status: event.target.value as ProductStatus,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="ACTIVE">Active</option>

                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={editingProduct.featured}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      featured: event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span>
                  <span className="block text-sm font-bold text-slate-700">
                    Featured Product
                  </span>

                  <span className="block text-xs text-slate-400">
                    Display this product in featured product sections.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleEditSave()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <RefreshCw className="h-4 w-4 animate-spin" />}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Product Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-7 p-6 sm:grid-cols-[180px_1fr]">
              <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={selectedProduct.image}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      SKU
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {selectedProduct.sku}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {selectedProduct.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Price
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {formatPrice(selectedProduct.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Stock
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {selectedProduct.stock} units
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rating
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {selectedProduct.rating.toFixed(1)}
                      /5
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Featured
                    </p>

                    <p className="mt-1 font-bold text-slate-950">
                      {selectedProduct.featured ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 font-bold text-slate-950">
                    {getDisplayStatus(selectedProduct)}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedProduct.description ||
                      "No product description has been added yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-6 text-right">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
