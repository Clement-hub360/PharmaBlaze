import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

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

function getReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return `${minutes} min read`;
}

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default function HealthArticles() {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/blog");

        const posts = (response.data.data || []) as BlogPost[];

        const publishedPosts = posts
          .filter((post) => post.published)
          .sort((a, b) => {
            const dateA = new Date(a.publishedAt || a.createdAt).getTime();

            const dateB = new Date(b.publishedAt || b.createdAt).getTime();

            return dateB - dateA;
          });

        if (!cancelled) {
          setArticles(publishedPosts);
        }
      } catch (err) {
        console.error("Load health articles error:", err);

        if (!cancelled) {
          const axiosError = err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

          setError(
            axiosError.response?.data?.message ||
              "Unable to load health articles right now. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredArticle = useMemo(() => {
    return articles[0] || null;
  }, [articles]);

  const remainingArticles = useMemo(() => {
    return articles.slice(1);
  }, [articles]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-100">
            Health & Wellness
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Health Articles & Resources
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
            Explore practical health and wellness information designed to help
            you make more informed everyday health decisions.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ERROR */}
          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
              <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

              <div>
                <p className="font-semibold text-red-900">
                  Unable to load articles
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
              <RefreshCw
                className="mx-auto animate-spin text-blue-600"
                size={36}
              />

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Loading Health Articles
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we retrieve the latest resources.
              </p>
            </div>
          ) : articles.length === 0 ? (
            /* EMPTY */
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <BookOpen className="text-blue-600" size={30} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                No Health Articles Yet
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                Our health and wellness resources are being prepared. Please
                check back soon for new educational content.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Back to Home
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* SECTION HEADER */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Latest Resources
                </h2>

                <p className="mt-2 text-slate-600">
                  Browse our latest health and medication education resources.
                </p>
              </div>

              {/* FEATURED ARTICLE */}
              {featuredArticle && (
                <article className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid lg:grid-cols-2">
                    <div className="relative min-h-[280px] bg-blue-50">
                      {featuredArticle.image ? (
                        <img
                          src={featuredArticle.image}
                          alt={featuredArticle.title}
                          className="h-full min-h-[280px] w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full min-h-[280px] items-center justify-center">
                          <BookOpen
                            className="text-blue-500"
                            size={70}
                            strokeWidth={1.4}
                          />
                        </div>
                      )}

                      <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                        Featured Article
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-10">
                      <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        Health & Wellness
                      </span>

                      <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                        {featuredArticle.title}
                      </h3>

                      <p className="mt-4 leading-7 text-slate-600">
                        {featuredArticle.excerpt ||
                          "Explore this educational health resource from Pharmablaze Pharmacy."}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />

                          {formatDate(
                            featuredArticle.publishedAt ||
                              featuredArticle.createdAt,
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />

                          {getReadTime(featuredArticle.content)}
                        </span>
                      </div>

                      <Link
                        to={`/health/articles/${featuredArticle.slug}`}
                        className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Read Featured Article
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                </article>
              )}

              {/* ARTICLE GRID */}
              {remainingArticles.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {remainingArticles.map((article) => (
                    <article
                      key={article.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-blue-50">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon
                            size={58}
                            strokeWidth={1.4}
                            className="text-blue-500"
                          />
                        )}
                      </div>

                      <div className="p-6">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          Health & Wellness
                        </span>

                        <h3 className="mt-4 text-xl font-bold text-slate-900">
                          {article.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {article.excerpt ||
                            "Explore this educational health resource from Pharmablaze Pharmacy."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />

                            {formatDate(
                              article.publishedAt || article.createdAt,
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} />

                            {getReadTime(article.content)}
                          </span>
                        </div>

                        <Link
                          to={`/health/articles/${article.slug}`}
                          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                        >
                          Read Article
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
