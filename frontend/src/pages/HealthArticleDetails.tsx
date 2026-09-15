import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Link2,
  RefreshCw,
  Share2,
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

function calculateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(date: string | null) {
  if (!date) return "Recently published";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function HealthArticleDetails() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticle = async () => {
    if (!slug) {
      setError("Article not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/blog/slug/${slug}`);

      const article = response.data.data as BlogPost;

      if (!article || !article.published) {
        setError("This article is not available.");
        setPost(null);
        return;
      }

      setPost(article);

      try {
        const relatedResponse = await api.get("/blog/published");

        const allPosts = (relatedResponse.data.data ?? []) as BlogPost[];

        setRelatedPosts(
          allPosts.filter((item) => item.slug !== article.slug).slice(0, 3),
        );
      } catch {
        setRelatedPosts([]);
      }
    } catch (err) {
      console.error("Failed to load article:", err);

      setPost(null);

      setError("We couldn't load this article right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadArticle();
  }, [slug]);

  const readTime = useMemo(
    () => (post ? calculateReadTime(post.content) : "1 min read"),
    [post],
  );

  const articleUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareArticle = async () => {
    if (!post) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt ?? post.title,
          url: articleUrl,
        });
      } catch {
        // User closed the share dialog.
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(articleUrl);

      window.alert("Article link copied to your clipboard.");
    } catch {
      window.alert("Unable to copy the article link.");
    }
  };

  const copyArticleLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);

      window.alert("Article link copied to your clipboard.");
    } catch {
      window.alert("Unable to copy the article link.");
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      articleUrl,
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      post?.title ?? "",
    )}&url=${encodeURIComponent(articleUrl)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4">
          <div className="text-center">
            <RefreshCw
              size={34}
              className="mx-auto animate-spin text-emerald-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading article...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <BookOpen size={48} className="mx-auto text-slate-300" />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Article unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              {error || "The article you're looking for could not be found."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void loadArticle()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <Link
                to="/health/articles"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                All Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getBlogImageUrl(post.image);

  return (
    <div className="min-h-screen bg-slate-50">
      <article>
        {/* Article Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
              to="/health/articles"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              <ArrowLeft size={17} />
              Back to Health Articles
            </Link>

            <div className="mt-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                <BookOpen size={15} />
                Health & Wellness
              </div>

              <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={17} />
                  {formatDate(post.publishedAt)}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3 size={17} />
                  {readTime}
                </span>

                <span>Pharmablaze Pharmacy</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          {imageUrl ? (
            <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-sm">
              <img
                src={imageUrl}
                alt={post.title}
                className="max-h-[560px] w-full object-cover"
                onError={() => {
                  console.error("Failed to load blog image:", imageUrl);
                }}
              />
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-slate-100 shadow-sm sm:min-h-[380px]">
              <div className="text-center">
                <BookOpen size={64} className="mx-auto text-emerald-300" />

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Pharmablaze Health & Wellness
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                <div className="prose prose-slate max-w-none">
                  {post.content.split(/\n{2,}/).map((paragraph, index) => {
                    const trimmedParagraph = paragraph.trim();

                    if (!trimmedParagraph) {
                      return null;
                    }

                    if (trimmedParagraph.startsWith("## ")) {
                      return (
                        <h2
                          key={index}
                          className="mt-8 text-2xl font-bold text-slate-900 first:mt-0"
                        >
                          {trimmedParagraph.replace(/^##\s+/, "")}
                        </h2>
                      );
                    }

                    if (trimmedParagraph.startsWith("# ")) {
                      return (
                        <h2
                          key={index}
                          className="mt-8 text-2xl font-bold text-slate-900 first:mt-0"
                        >
                          {trimmedParagraph.replace(/^#\s+/, "")}
                        </h2>
                      );
                    }

                    return (
                      <p
                        key={index}
                        className="mb-5 text-base leading-8 text-slate-700 last:mb-0"
                      >
                        {trimmedParagraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Health Notice */}
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-900">
                  Educational information
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  This article is provided for general educational purposes and
                  should not be treated as personalized medical advice,
                  diagnosis, or treatment.
                </p>
              </div>
            </div>

            {/* Share Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-emerald-600" />

                  <h2 className="font-semibold text-slate-900">
                    Share Article
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={shareOnFacebook}
                    className="flex items-center justify-center rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
                    title="Share on Facebook"
                    aria-label="Share on Facebook"
                  >
                    <Share2 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={shareOnTwitter}
                    className="flex items-center justify-center rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
                    title="Share on X"
                    aria-label="Share on X"
                  >
                    <Share2 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={copyArticleLink}
                    className="flex items-center justify-center rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
                    title="Copy article link"
                    aria-label="Copy article link"
                  >
                    <Link2 size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={shareArticle}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  Keep Reading
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  More Health Articles
                </h2>
              </div>

              <Link
                to="/health/articles"
                className="hidden items-center gap-2 text-sm font-semibold text-emerald-700 sm:inline-flex"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((article) => {
                const relatedImageUrl = getBlogImageUrl(article.image);

                return (
                  <article
                    key={article.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {relatedImageUrl ? (
                      <img
                        src={relatedImageUrl}
                        alt={article.title}
                        className="aspect-[16/9] w-full object-cover"
                        onError={() => {
                          console.error(
                            "Failed to load related blog image:",
                            relatedImageUrl,
                          );
                        }}
                      />
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center bg-emerald-50">
                        <BookOpen size={40} className="text-emerald-300" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatDate(article.publishedAt)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} />
                          {calculateReadTime(article.content)}
                        </span>
                      </div>

                      <h3 className="mt-3 font-bold leading-6 text-slate-900">
                        {article.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {article.excerpt ||
                          article.content.substring(0, 140) + "..."}
                      </p>

                      <Link
                        to={`/health/articles/${article.slug}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                      >
                        Read Article
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default HealthArticleDetails;
