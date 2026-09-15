import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  FilePenLine,
  FileText,
  Globe2,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
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

const BACKEND_BASE_URL = "http://localhost:5000";

function getBlogImageUrl(image: string | null | undefined): string {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return image.startsWith("/")
    ? `${BACKEND_BASE_URL}${image}`
    : `${BACKEND_BASE_URL}/${image}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown, fallback: string): string {
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
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function getStatusClasses(published: boolean): string {
  return published
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"All" | ArticleStatus>(
    "All",
  );

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [showEditor, setShowEditor] = useState(false);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [newTitle, setNewTitle] = useState("");

  const [newExcerpt, setNewExcerpt] = useState("");

  const [newContent, setNewContent] = useState("");

  const [newImage, setNewImage] = useState("");

  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [newImagePreview, setNewImagePreview] = useState("");

  const [newStatus, setNewStatus] = useState<ArticleStatus>("Draft");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * Create a temporary browser preview whenever
   * the administrator selects a new image file.
   *
   * The object URL is revoked when the file changes
   * or the component is unmounted.
   */
  useEffect(() => {
    if (!newImageFile) {
      setNewImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(newImageFile);

    setNewImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [newImageFile]);

  async function fetchPosts() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/blog");

      setPosts(response.data.data as BlogPost[]);
    } catch (requestError) {
      console.error("Unable to load blog posts:", requestError);

      setError(getErrorMessage(requestError, "Unable to load blog posts."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        normalizedSearch === "" ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.slug.toLowerCase().includes(normalizedSearch) ||
        (post.excerpt ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Published" ? post.published : !post.published);

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const publishedCount = posts.filter((post) => post.published).length;

  const draftCount = posts.filter((post) => !post.published).length;

  const totalWords = posts.reduce((total, post) => {
    return total + post.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  function resetEditor() {
    setEditingPost(null);
    setNewTitle("");
    setNewExcerpt("");
    setNewContent("");
    setNewImage("");
    setNewImageFile(null);
    setNewImagePreview("");
    setNewStatus("Draft");
  }

  function openCreateEditor() {
    setError("");
    setSuccess("");
    resetEditor();
    setShowEditor(true);
  }

  function openEditEditor(post: BlogPost) {
    setError("");
    setSuccess("");

    setEditingPost(post);
    setNewTitle(post.title);
    setNewExcerpt(post.excerpt ?? "");
    setNewContent(post.content);
    setNewImage(post.image ?? "");
    setNewImageFile(null);
    setNewImagePreview("");
    setNewStatus(post.published ? "Published" : "Draft");

    setShowEditor(true);
  }

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setError("");
    setSuccess("");

    if (!file) {
      setNewImageFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setNewImageFile(null);

      setError("Invalid image type. Please select a JPG, PNG, or WEBP image.");

      return;
    }

    if (file.size > maxSize) {
      event.target.value = "";
      setNewImageFile(null);

      setError("Image is too large. Please select an image smaller than 5 MB.");

      return;
    }

    /*
     * Selecting a file takes priority over
     * an existing image URL.
     */
    setNewImageFile(file);
    setNewImage("");
  }

  function handleImageUrlChange(value: string) {
    setNewImage(value);

    /*
     * If the administrator starts entering an
     * image URL, cancel the selected local file.
     */
    if (newImageFile) {
      setNewImageFile(null);

      const fileInput = document.getElementById(
        "article-image-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    }
  }

  async function handleSavePost() {
    setError("");
    setSuccess("");

    const title = newTitle.trim();

    const content = newContent.trim();

    if (!title) {
      setError("Article title is required.");

      return;
    }

    if (!content) {
      setError("Article content is required.");

      return;
    }

    setSaving(true);

    try {
      let imageUrl = newImage.trim() || undefined;

      /*
       * If a new local image was selected,
       * upload it first.
       */
      if (newImageFile) {
        const formData = new FormData();

        formData.append("image", newImageFile);

        const uploadResponse = await api.post("/blog/upload-image", formData);

        const uploadedImage = uploadResponse.data?.data?.url;

        if (typeof uploadedImage !== "string" || uploadedImage.trim() === "") {
          throw new Error(
            "Image upload completed but no image URL was returned.",
          );
        }

        imageUrl = uploadedImage;
      }

      const slug =
        editingPost?.slug && newTitle.trim() === editingPost.title.trim()
          ? editingPost.slug
          : slugify(title);

      const payload = {
        title,
        slug,
        excerpt: newExcerpt.trim() || undefined,
        content,
        image: imageUrl,
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
    } catch (requestError) {
      console.error("Unable to save blog post:", requestError);

      setError(
        getErrorMessage(
          requestError,
          newImageFile
            ? "Unable to upload the image or save the article."
            : "Unable to save the article.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(post: BlogPost) {
    const confirmed = window.confirm(
      `Delete "${post.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(post.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/blog/${post.id}`);

      if (selectedPost?.id === post.id) {
        setSelectedPost(null);
      }

      setSuccess("Article deleted successfully.");

      await fetchPosts();
    } catch (requestError) {
      console.error("Unable to delete blog post:", requestError);

      setError(getErrorMessage(requestError, "Unable to delete the article."));
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    const header = ["Title", "Slug", "Status", "Published At", "Created At"];

    const rows = posts.map((post) => [
      post.title,
      post.slug,
      post.published ? "Published" : "Draft",
      post.publishedAt ?? "",
      post.createdAt,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const safeValue = String(value).replace(/"/g, '""');

            return `"${safeValue}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "pharmablaze-blog-posts.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function openArticle(post: BlogPost) {
    window.open(
      `/health/articles/${post.slug}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const editorImage = newImagePreview || getBlogImageUrl(newImage);

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
            <BookOpen size={16} />
            <span>Content Management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Blog & Articles
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
            Create, publish, edit, and manage health articles for your
            customers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              void fetchPosts();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <FileText size={17} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openCreateEditor}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            New Article
          </button>
        </div>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto shrink-0 rounded-lg p-1 transition hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto shrink-0 rounded-lg p-1 transition hover:bg-emerald-100"
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ======================================================
          STAT CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <FileText size={21} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {posts.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">Articles</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Globe2 size={21} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Live
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {publishedCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">Published</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
              <FilePenLine size={21} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Work
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">{draftCount}</p>

          <p className="mt-1 text-sm text-slate-500">Drafts</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <BookOpen size={21} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Content
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {totalWords.toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-slate-500">Total words</p>
        </div>
      </div>

      {/* ======================================================
          SEARCH / FILTER
      ====================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search articles by title, slug, or excerpt..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {(["All", "Published", "Draft"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  statusFilter === filter
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          DESKTOP TABLE
      ====================================================== */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Article
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Read time
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="inline-flex items-center gap-3 text-sm font-medium text-slate-500">
                      <RefreshCw size={18} className="animate-spin" />
                      Loading articles...
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <BookOpen size={25} />
                      </div>

                      <h3 className="mt-4 text-base font-bold text-slate-900">
                        No articles found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or create a new article.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const imageUrl = getBlogImageUrl(post.image);

                  return (
                    <tr
                      key={post.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <ImageIcon size={22} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedPost(post)}
                              className="block max-w-[430px] truncate text-left text-sm font-bold text-slate-900 hover:text-emerald-600"
                            >
                              {post.title}
                            </button>

                            <p className="mt-1 max-w-[430px] truncate text-xs text-slate-500">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                            post.published,
                          )}`}
                        >
                          {post.published ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock3 size={14} />
                          )}

                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays size={16} className="text-slate-400" />

                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={16} className="text-slate-400" />
                          {getReadTime(post.content)} min
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="View article"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditEditor(post)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                            title="Edit article"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeletePost(post)}
                            disabled={deletingId === post.id}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete article"
                          >
                            {deletingId === post.id ? (
                              <RefreshCw size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          MOBILE CARDS
      ====================================================== */}
      <div className="space-y-3 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="inline-flex items-center gap-3 text-sm font-medium text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading articles...
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BookOpen size={25} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No articles found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or create a new article.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const imageUrl = getBlogImageUrl(post.image);

            return (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageIcon size={22} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="line-clamp-2 text-left text-sm font-bold text-slate-900 hover:text-emerald-600"
                    >
                      {post.title}
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClasses(
                          post.published,
                        )}`}
                      >
                        {post.published ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock3 size={12} />
                        )}

                        {post.published ? "Published" : "Draft"}
                      </span>

                      <span className="text-xs text-slate-400">
                        {getReadTime(post.content)} min read
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </span>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditEditor(post)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeletePost(post)}
                      disabled={deletingId === post.id}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === post.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================
          ARTICLE PREVIEW MODAL
      ====================================================== */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Article preview
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
                  {selectedPost.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={21} />
              </button>
            </div>

            <div className="overflow-y-auto">
              {selectedPost.image && (
                <div className="aspect-[16/7] w-full bg-slate-100">
                  <img
                    src={getBlogImageUrl(selectedPost.image)}
                    alt={selectedPost.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span
                    className={`rounded-full border px-3 py-1 font-bold ${getStatusClasses(
                      selectedPost.published,
                    )}`}
                  >
                    {selectedPost.published ? "Published" : "Draft"}
                  </span>

                  <span>
                    {formatDate(
                      selectedPost.publishedAt ?? selectedPost.createdAt,
                    )}
                  </span>

                  <span>{getReadTime(selectedPost.content)} min read</span>
                </div>

                {selectedPost.excerpt && (
                  <p className="mt-5 text-base font-medium leading-7 text-slate-600">
                    {selectedPost.excerpt}
                  </p>
                )}

                <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {selectedPost.content}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => openEditEditor(selectedPost)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Edit3 size={17} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => openArticle(selectedPost)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <ExternalLink size={17} />
                Open Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  {editingPost ? "Edit article" : "Create article"}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingPost ? "Update Blog Article" : "New Blog Article"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!saving) {
                    setShowEditor(false);
                    resetEditor();
                  }
                }}
                disabled={saving}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label
                    htmlFor="article-title"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Article Title
                  </label>

                  <input
                    id="article-title"
                    type="text"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="Enter a clear, helpful article title"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="article-status"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Publication Status
                  </label>

                  <select
                    id="article-status"
                    value={newStatus}
                    onChange={(event) =>
                      setNewStatus(event.target.value as ArticleStatus)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
                  >
                    <option value="Draft">Draft</option>

                    <option value="Published">Published</option>
                  </select>
                </div>

                {/* Excerpt */}
                <div>
                  <label
                    htmlFor="article-excerpt"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Excerpt
                    <span className="ml-2 font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="article-excerpt"
                    value={newExcerpt}
                    onChange={(event) => setNewExcerpt(event.target.value)}
                    rows={3}
                    placeholder="A short summary that introduces the article..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* ==================================================
                    FEATURED IMAGE
                ================================================== */}
                <div>
                  <label
                    htmlFor="article-image-file"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Featured Image
                  </label>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {editorImage ? (
                          <img
                            src={editorImage}
                            alt="Featured image preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={28} className="text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          Upload an article image
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          JPG, PNG, or WEBP · Maximum 5 MB
                        </p>

                        <label
                          htmlFor="article-image-file"
                          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <ImageIcon size={17} />

                          {newImageFile
                            ? "Choose another image"
                            : "Choose image"}
                        </label>

                        <input
                          id="article-image-file"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    {newImageFile && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="truncate text-sm font-semibold text-emerald-800">
                            {newImageFile.name}
                          </p>

                          <p className="text-xs font-medium text-emerald-700">
                            {(newImageFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>

                        <p className="mt-1 text-xs text-emerald-700">
                          This image will be uploaded when you save the article.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Existing URL fallback */}
                  <div className="mt-4">
                    <label
                      htmlFor="article-image-url"
                      className="mb-2 block text-xs font-semibold text-slate-500"
                    >
                      Or use an image URL
                    </label>

                    <input
                      id="article-image-url"
                      type="url"
                      value={newImage}
                      onChange={(event) =>
                        handleImageUrlChange(event.target.value)
                      }
                      placeholder="https://example.com/article-image.jpg"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Selecting a new image file will replace the URL
                      automatically.
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="article-content"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Article Content
                    </label>

                    <span className="text-xs text-slate-400">
                      {newContent.trim().split(/\s+/).filter(Boolean).length}{" "}
                      words
                    </span>
                  </div>

                  <textarea
                    id="article-content"
                    value={newContent}
                    onChange={(event) => setNewContent(event.target.value)}
                    rows={14}
                    placeholder="Write the full health article here..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* Publishing notice */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <Globe2 size={18} className="mt-0.5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      {newStatus === "Published"
                        ? "This article will be published."
                        : "This article will remain a draft."}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Published articles can be displayed on the public health
                      articles section.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowEditor(false);
                  resetEditor();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSavePost()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />

                    {newImageFile ? "Uploading & Saving..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    {editingPost ? "Update Article" : "Save Article"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
