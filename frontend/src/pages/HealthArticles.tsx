import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "../services/api";

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

function calculateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(date: string | null) {
  if (!date) return "Recently published";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function HealthArticles() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/blog/published");

      setPosts(response.data.data ?? []);
    } catch (err) {
      console.error("Failed to load health articles:", err);
      setError(
        "We couldn't load the health articles right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  const filteredPosts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchValue) ||
        post.slug.toLowerCase().includes(searchValue) ||
        (post.excerpt ?? "").toLowerCase().includes(searchValue) ||
        post.content.toLowerCase().includes(searchValue),
    );
  }, [posts, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <BookOpen size={17} />
              Health & Wellness
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Health Articles & Resources
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore educational health information, wellness guidance, and
              practical pharmacy resources from Pharmablaze Pharmacy.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-2xl">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search health articles..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <RefreshCw
              className="mx-auto animate-spin text-emerald-600"
              size={32}
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading health articles...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="font-semibold text-red-800">{error}</p>

            <button
              type="button"
              onClick={() => void loadArticles()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Articles */}
        {!loading && !error && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Latest Articles
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredPosts.length} article
                  {filteredPosts.length === 1 ? "" : "s"} available
                </p>
              </div>
            </div>

            {filteredPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image */}
                    {post.image ? (
                      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
                        <BookOpen size={48} className="text-emerald-300" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(post.publishedAt)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {calculateReadTime(post.content)}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold leading-7 text-slate-900">
                        {post.title}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {post.excerpt || post.content.substring(0, 160) + "..."}
                      </p>

                      <Link
                        to={`/health/articles/${post.slug}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800"
                      >
                        Read Article
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <BookOpen className="mx-auto text-slate-300" size={48} />

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  No articles found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {search
                    ? "Try a different search term."
                    : "Published health articles will appear here."}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HealthArticles;
