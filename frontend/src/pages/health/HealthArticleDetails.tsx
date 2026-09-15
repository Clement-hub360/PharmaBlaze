import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

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

const BACKEND_BASE_URL = "http://localhost:5000";

function getBlogImageUrl(image: string | null | undefined): string {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${BACKEND_BASE_URL}${image}`;
  }

  return `${BACKEND_BASE_URL}/${image}`;
}

function getReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / 200));

  return `${minutes} min read`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function HealthArticleDetails() {
  const { slug } = useParams();

  const [article, setArticle] = useState<BlogPost | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      if (!slug) {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/blog");

        const posts = (response.data.data || []) as BlogPost[];

        const foundArticle = posts.find(
          (post) => post.slug === slug && post.published === true,
        );

        if (!foundArticle) {
          if (!cancelled) {
            setArticle(null);

            setError(
              "The health article you are looking for could not be found.",
            );
          }

          return;
        }

        if (!cancelled) {
          setArticle(foundArticle);
        }
      } catch (err) {
        console.error("Load health article error:", err);

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
              "Unable to load this article right now. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto animate-spin text-blue-600" size={36} />

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Loading Article
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we retrieve the article.
          </p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="text-red-500" size={30} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Article Not Found
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            {error ||
              "The health article you are looking for could not be found."}
          </p>

          <Link
            to="/health/articles"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Articles
          </Link>
        </div>
      </main>
    );
  }

  const articleImageUrl = getBlogImageUrl(article.image);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/health/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Health Articles
          </Link>

          <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <BookOpen size={32} />
          </div>

          <span className="mt-6 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            Health & Wellness
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50 sm:text-lg">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-blue-100">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} />

              {formatDate(article.publishedAt || article.createdAt)}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} />

              {getReadTime(article.content)}
            </span>
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* FEATURED IMAGE */}
          {article.image ? (
            <div className="overflow-hidden bg-slate-100">
              <img
                src={articleImageUrl}
                alt={article.title}
                className="max-h-[560px] w-full object-cover"
                onError={(event) => {
                  console.error(
                    "Failed to load article image:",
                    articleImageUrl,
                  );

                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center bg-blue-50">
              <div className="text-center">
                <ImageIcon
                  className="mx-auto text-blue-400"
                  size={64}
                  strokeWidth={1.4}
                />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Health & Wellness
                </p>
              </div>
            </div>
          )}

          {/* ARTICLE CONTENT */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="prose prose-slate max-w-none">
              {article.content.split(/\n\s*\n/).map((paragraph, index) => {
                const trimmedParagraph = paragraph.trim();

                if (!trimmedParagraph) {
                  return null;
                }

                return (
                  <p
                    key={`${article.id}-${index}`}
                    className="mb-6 text-base leading-8 text-slate-700 last:mb-0"
                  >
                    {trimmedParagraph}
                  </p>
                );
              })}
            </div>

            {/* MEDICAL NOTICE */}
            <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm leading-6 text-blue-900">
                <strong>Important:</strong> This content is provided for general
                educational purposes and does not replace professional medical
                advice, diagnosis, or treatment. Speak with a qualified
                healthcare professional or pharmacist for advice specific to
                your situation.
              </p>
            </div>

            {/* BACK */}
            <div className="mt-10 border-t border-slate-200 pt-7">
              <Link
                to="/health/articles"
                className="inline-flex items-center gap-2 font-bold text-blue-600 transition hover:text-blue-700"
              >
                <ArrowLeft size={17} />
                Back to Health Articles
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
