import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Eye,
  Edit3,
  Trash2,
  X,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePenLine,
  BookOpen,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  Globe2,
  Save,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

type ArticleStatus = "Published" | "Draft";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newStatus, setNewStatus] = useState<ArticleStatus>("Draft");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const slugify = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    const axiosError = err as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return axiosError.response?.data?.message || fallback;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/blog");

      setPosts((response.data.data || []) as BlogPost[]);
    } catch (err) {
      console.error("Get blog posts error:", err);
      setError(
        getErrorMessage(err, "Unable to load blog articles. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return posts.filter((post) => {
      const matchesSearch =
        !searchValue ||
        post.title.toLowerCase().includes(searchValue) ||
        post.slug.toLowerCase().includes(searchValue) ||
        (post.excerpt || "").toLowerCase().includes(searchValue) ||
        post.content.toLowerCase().includes(searchValue);

      const status: ArticleStatus = post.published ? "Published" : "Draft";

      const matchesStatus = statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const publishedCount = posts.filter((post) => post.published).length;
  const draftCount = posts.filter((post) => !post.published).length;

  const totalWords = posts.reduce((total, post) => {
    return total + post.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const getReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not published";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusClasses = (status: ArticleStatus) => {
    if (status === "Published") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const resetEditor = () => {
    setNewTitle("");
    setNewExcerpt("");
    setNewContent("");
    setNewImage("");
    setNewStatus("Draft");
    setEditingPost(null);
    setError("");
  };

  const openCreateEditor = () => {
    resetEditor();
    setShowEditor(true);
  };

  const openEditEditor = (post: BlogPost) => {
    setEditingPost(post);
    setNewTitle(post.title);
    setNewExcerpt(post.excerpt || "");
    setNewContent(post.content);
    setNewImage(post.image || "");
    setNewStatus(post.published ? "Published" : "Draft");
    setError("");
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (saving) return;

    setShowEditor(false);
    resetEditor();
  };

  const handleSavePost = async () => {
    if (!newTitle.trim()) {
      setError("Article title is required.");
      return;
    }

    if (!newContent.trim()) {
      setError("Full article content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const title = newTitle.trim();
      const slug = slugify(title);

      const payload = {
        title,
        slug,
        excerpt: newExcerpt.trim() || undefined,
        content: newContent.trim(),
        image: newImage.trim() || undefined,
        published: newStatus === "Published",
      };

      if (editingPost) {
        await api.patch(`/blog/${editingPost.id}`, payload);
        setSuccess("Article updated successfully.");
      } else {
        await api.post("/blog", payload);
        setSuccess("Article created successfully.");
      }

      setShowEditor(false);
      resetEditor();

      await fetchPosts();
    } catch (err) {
      console.error("Save blog post error:", err);

      setError(
        getErrorMessage(
          err,
          editingPost
            ? "Unable to update the article."
            : "Unable to create the article.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const post = posts.find((item) => item.id === id);

    if (!post) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${post.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(`/blog/${id}`);

      setPosts((currentPosts) => currentPosts.filter((item) => item.id !== id));

      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }

      setSuccess("Article deleted successfully.");
    } catch (err) {
      console.error("Delete blog post error:", err);

      setError(
        getErrorMessage(err, "Unable to delete the article. Please try again."),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (filteredPosts.length === 0) {
      setError("There are no articles to export.");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Slug",
      "Excerpt",
      "Published",
      "Published At",
      "Created At",
      "Updated At",
    ];

    const escapeCsv = (value: string) => {
      return `"${value.replace(/"/g, '""')}"`;
    };

    const rows = filteredPosts.map((post) => [
      post.id,
      post.title,
      post.slug,
      post.excerpt || "",
      post.published ? "Published" : "Draft",
      post.publishedAt || "",
      post.createdAt,
      post.updatedAt,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pharmablaze-blog-articles.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const openArticle = (post: BlogPost) => {
    if (post.published) {
      window.open(`/health/articles/${post.slug}`, "_blank");
    } else {
      setSelectedPost(post);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Admin</span>
                <span>/</span>
                <span>Blog & Health Articles</span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Blog & Health Articles
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Create, organize, publish, and manage educational content stored
                in your Pharmablaze database.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FileText size={18} />
                Export CSV
              </button>

              <button
                type="button"
                onClick={openCreateEditor}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Plus size={18} />
                New Article
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Feedback */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-900">
                Something went wrong
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 hover:bg-red-100"
              aria-label="Close error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-600"
              size={20}
            />

            <p className="text-sm font-medium leading-6 text-emerald-800">
              {success}
            </p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
              aria-label="Close success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3">
                <BookOpen className="text-emerald-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Database
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {posts.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">Total articles</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3">
                <Globe2 className="text-blue-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">Live</span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {publishedCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">Published articles</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3">
                <FilePenLine className="text-amber-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Work in progress
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {draftCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">Draft articles</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3">
                <FileText className="text-purple-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Content
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {totalWords.toLocaleString()}
            </p>

            <p className="mt-1 text-sm text-slate-500">Total words</p>
          </div>
        </section>

        {/* Health content notice */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <FileText className="mt-0.5 shrink-0 text-blue-600" size={21} />

            <div>
              <h2 className="text-sm font-semibold text-blue-900">
                Health content notice
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Articles should be educational and reviewed appropriately before
                publication. Avoid presenting general information as personal
                medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles, slugs or content..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>

              <button
                type="button"
                onClick={() => void fetchPosts()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Desktop table */}
        <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Articles</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredPosts.length} article
                  {filteredPosts.length === 1 ? "" : "s"} displayed
                </p>
              </div>

              <FileText className="text-slate-300" size={24} />
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw
                className="mx-auto animate-spin text-emerald-600"
                size={32}
              />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading articles from PostgreSQL...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <BookOpen className="mx-auto text-slate-300" size={44} />

              <h3 className="mt-4 font-semibold text-slate-900">
                No articles found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {posts.length === 0
                  ? "Your blog database is currently empty. Create your first article."
                  : "Try changing your search or status filter."}
              </p>

              {posts.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateEditor}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={17} />
                  Create First Article
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Article</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Published / Updated</th>
                    <th className="px-5 py-4">Read Time</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPosts.map((post) => {
                    const status: ArticleStatus = post.published
                      ? "Published"
                      : "Draft";

                    return (
                      <tr
                        key={post.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-slate-100">
                              {post.image ? (
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <ImageIcon
                                  className="text-slate-400"
                                  size={21}
                                />
                              )}
                            </div>

                            <div className="max-w-md">
                              <p className="font-semibold text-slate-900">
                                {post.title}
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                {post.excerpt || "No excerpt provided."}
                              </p>

                              <p className="mt-1 text-[11px] font-medium text-slate-400">
                                ID: {post.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex max-w-xs rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            /{post.slug}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={16}
                              className="text-slate-400"
                            />

                            {formatDate(post.publishedAt || post.updatedAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {getReadTime(post.content)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              status,
                            )}`}
                          >
                            {status === "Published" ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Clock3 size={14} />
                            )}

                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openArticle(post)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                              title={
                                post.published
                                  ? "Open published article"
                                  : "Preview article"
                              }
                            >
                              {post.published ? (
                                <ExternalLink size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditEditor(post)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                              title="Edit article"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete article"
                            >
                              {deletingId === post.id ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Mobile article cards */}
        <section className="mt-6 space-y-4 lg:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
              <RefreshCw
                className="mx-auto animate-spin text-emerald-600"
                size={32}
              />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading articles...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <BookOpen className="mx-auto text-slate-300" size={44} />

              <h3 className="mt-4 font-semibold text-slate-900">
                No articles found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {posts.length === 0
                  ? "Create your first article to get started."
                  : "Try changing your search or filter."}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const status: ArticleStatus = post.published
                ? "Published"
                : "Draft";

              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-slate-100">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-slate-400" size={23} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {post.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {post.excerpt ||
                          "No excerpt provided for this article."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(post.publishedAt || post.updatedAt)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {getReadTime(post.content)}
                    </span>
                  </div>

                  <p className="mt-3 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    /{post.slug}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => openArticle(post)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {post.published ? (
                        <ExternalLink size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditEditor(post)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                    >
                      {deletingId === post.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* View Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Article Preview
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPost.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {selectedPost.image ? (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="max-h-80 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex min-h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto text-slate-300" size={52} />

                    <p className="mt-3 font-semibold text-slate-700">
                      No Featured Image
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                    selectedPost.published ? "Published" : "Draft",
                  )}`}
                >
                  {selectedPost.published ? "Published" : "Draft"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {getReadTime(selectedPost.content)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Created</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedPost.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Published</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedPost.publishedAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Updated</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedPost.updatedAt)}
                  </p>
                </div>
              </div>

              {selectedPost.excerpt && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Excerpt
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {selectedPost.excerpt}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Article Content
                </p>

                <div className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  {selectedPost.content}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Slug
                </p>

                <p className="mt-1 break-all text-sm text-slate-600">
                  /{selectedPost.slug}
                </p>
              </div>

              <div className="flex gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPost(null);
                    openEditEditor(selectedPost);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Edit3 size={17} />
                  Edit Article
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Content Manager
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingPost ? "Edit Article" : "Create New Article"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close editor"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle
                    className="mt-0.5 shrink-0 text-red-600"
                    size={19}
                  />

                  <p className="text-sm leading-6 text-red-700">{error}</p>
                </div>
              )}

              {/* Featured image */}
              <div>
                <label
                  htmlFor="article-image"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Featured Image URL
                </label>

                <input
                  id="article-image"
                  type="url"
                  value={newImage}
                  onChange={(event) => setNewImage(event.target.value)}
                  placeholder="https://example.com/article-image.jpg"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                {newImage.trim() && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <img
                      src={newImage}
                      alt="Article preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  Add the image URL you want to use for the article. Actual
                  file-upload storage can be added separately.
                </p>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="article-title"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Article Title
                </label>

                <input
                  id="article-title"
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Enter article title..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                {newTitle.trim() && (
                  <p className="mt-2 text-xs text-slate-500">
                    Slug:{" "}
                    <span className="font-medium text-slate-700">
                      /{slugify(newTitle)}
                    </span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="article-status"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Publishing Status
                </label>

                <select
                  id="article-status"
                  value={newStatus}
                  onChange={(event) =>
                    setNewStatus(event.target.value as ArticleStatus)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="article-excerpt"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Article Excerpt
                </label>

                <textarea
                  id="article-excerpt"
                  rows={4}
                  value={newExcerpt}
                  onChange={(event) => setNewExcerpt(event.target.value)}
                  placeholder="Write a short description of the article..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Full content */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="article-content"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Full Article Content
                  </label>

                  <span className="text-xs text-slate-400">
                    {newContent.trim()
                      ? `${newContent
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean)
                          .length.toLocaleString()} words • ${getReadTime(
                          newContent,
                        )}`
                      : "0 words"}
                  </span>
                </div>

                <textarea
                  id="article-content"
                  rows={14}
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  placeholder="Write the complete educational article here..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Publishing notice */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <Globe2 className="mt-0.5 shrink-0 text-blue-600" size={20} />

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Publishing workflow
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Draft articles remain unpublished. Selecting Published
                      will store the publication timestamp in PostgreSQL and
                      make the article available to the public publishing flow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleSavePost()}
                  disabled={saving || !newTitle.trim() || !newContent.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingPost ? (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Create Article
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlog;
