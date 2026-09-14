import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Edit,
  FolderPlus,
  Layers,
  Package,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Stethoscope,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import api from "../../services/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return axiosError.response?.data?.message || fallback;
}

function getCategoryIcon(name: string) {
  const value = name.toLowerCase();

  if (
    value.includes("medicine") ||
    value.includes("pharmacy") ||
    value.includes("drug") ||
    value.includes("pill")
  ) {
    return Pill;
  }

  if (
    value.includes("vitamin") ||
    value.includes("supplement") ||
    value.includes("nutrition")
  ) {
    return Activity;
  }

  if (
    value.includes("personal") ||
    value.includes("care") ||
    value.includes("beauty")
  ) {
    return Sparkles;
  }

  if (
    value.includes("medical") ||
    value.includes("device") ||
    value.includes("diagnostic")
  ) {
    return Stethoscope;
  }

  return Layers;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ApiResponse<Category[]>>("/categories");

      setCategories(response.data.data);
    } catch (err) {
      console.error("Load categories error:", err);
      setError(
        getApiErrorMessage(err, "Failed to load categories from the server."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        query === "" ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && category.active) ||
        (statusFilter === "INACTIVE" && !category.active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalProducts = categories.reduce(
      (sum, category) => sum + (category._count?.products ?? 0),
      0,
    );

    return {
      total: categories.length,
      active: categories.filter((category) => category.active).length,
      inactive: categories.filter((category) => !category.active).length,
      products: totalProducts,
    };
  }, [categories]);

  function openAddModal() {
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      active: category.active,
    });

    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugify(value),
    }));
  }

  function handleFormChange(
    field: keyof CategoryForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Category slug is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        image: form.image.trim(),
        active: form.active,
      };

      if (editingCategory) {
        const response = await api.patch<ApiResponse<Category>>(
          `/categories/${editingCategory.id}`,
          payload,
        );

        setCategories((current) =>
          current.map((category) =>
            category.id === editingCategory.id ? response.data.data : category,
          ),
        );
      } else {
        const response = await api.post<ApiResponse<Category>>(
          "/categories",
          payload,
        );

        setCategories((current) => [response.data.data, ...current]);
      }

      closeModal();
    } catch (err) {
      console.error("Save category error:", err);
      setError(
        getApiErrorMessage(err, "Failed to save category. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(category: Category) {
    try {
      setActionId(category.id);
      setError("");

      const response = await api.patch<ApiResponse<Category>>(
        `/categories/${category.id}`,
        {
          active: !category.active,
        },
      );

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? response.data.data : item,
        ),
      );
    } catch (err) {
      console.error("Toggle category error:", err);
      setError(
        getApiErrorMessage(
          err,
          "Failed to update category status. Please try again.",
        ),
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(category: Category) {
    const productCount = category._count?.products ?? 0;

    const message =
      productCount > 0
        ? `"${category.name}" contains ${productCount} product${
            productCount === 1 ? "" : "s"
          }. The server may prevent deletion while products are assigned to it.\n\nContinue?`
        : `Are you sure you want to delete "${category.name}"? This action cannot be undone.`;

    if (!window.confirm(message)) return;

    try {
      setActionId(category.id);
      setError("");

      await api.delete(`/categories/${category.id}`);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );
    } catch (err) {
      console.error("Delete category error:", err);
      setError(
        getApiErrorMessage(
          err,
          "Failed to delete category. If products are assigned to it, remove or reassign them first.",
        ),
      );
    } finally {
      setActionId(null);
    }
  }

  function exportCategories() {
    const headers = [
      "Name",
      "Slug",
      "Description",
      "Products",
      "Status",
      "Created",
    ];

    const rows = categories.map((category) => [
      category.name,
      category.slug,
      category.description ?? "",
      category._count?.products ?? 0,
      category.active ? "Active" : "Inactive",
      formatDate(category.createdAt),
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
    link.download = "pharmablaze-categories.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
              <FolderPlus className="h-4 w-4" />
              Product Catalogue
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Categories
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage your pharmacy product categories and organize products
              across the catalogue.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportCategories}
              disabled={categories.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Error */}
        {error && !isModalOpen && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Categories
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Layers className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Categories
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : stats.active}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ToggleRight className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Categories
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : stats.inactive}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <ToggleLeft className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Products Organized
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : stats.products}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === status
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status === "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Layers className="h-7 w-7" />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              No categories found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {categories.length === 0
                ? "Your database does not contain any categories yet. Add your first category to organize products."
                : "Try changing your search term or status filter."}
            </p>

            {categories.length === 0 && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add First Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const productCount = category._count?.products ?? 0;
              const isBusy = actionId === category.id;

              return (
                <div
                  key={category.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-50">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Icon className="h-8 w-8 text-emerald-600" />
                        </div>
                      </div>
                    )}

                    <div className="absolute right-4 top-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          category.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {category.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-900">
                          {category.name}
                        </h2>

                        <p className="mt-1 truncate text-xs font-medium text-slate-400">
                          /{category.slug}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="min-h-[48px] text-sm leading-6 text-slate-500">
                      {category.description ||
                        "No category description has been added yet."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Products
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                          <Package className="h-4 w-4 text-emerald-600" />
                          {productCount}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">
                          Created
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {formatDate(category.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        disabled={isBusy}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(category)}
                        disabled={isBusy}
                        title={
                          category.active
                            ? "Deactivate category"
                            : "Activate category"
                        }
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {category.active ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={isBusy}
                        title="Delete category"
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isBusy ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Result count */}
        {!loading && categories.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {filteredCategories.length} of {categories.length} categor
              {categories.length === 1 ? "y" : "ies"}
            </span>

            <span className="hidden sm:inline">
              Data is stored in PostgreSQL
            </span>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingCategory
                    ? "Update the category information stored in your database."
                    : "Create a new product category in your database."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="e.g. Vitamins & Supplements"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Slug
                  </label>

                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      handleFormChange("slug", slugify(event.target.value))
                    }
                    placeholder="vitamins-supplements"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Used in category URLs.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.active ? "active" : "inactive"}
                    onChange={(event) =>
                      handleFormChange(
                        "active",
                        event.target.value === "active",
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      handleFormChange("description", event.target.value)
                    }
                    placeholder="Describe the products that belong in this category..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Image URL
                  </label>

                  <input
                    type="url"
                    value={form.image}
                    onChange={(event) =>
                      handleFormChange("image", event.target.value)
                    }
                    placeholder="https://example.com/category-image.jpg"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Optional. If provided, this image will appear on the
                    category card.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCategory ? (
                        <Edit className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {editingCategory ? "Save Changes" : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
