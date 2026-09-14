import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock3,
  Trash2,
  Eye,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  deleteReview,
  getAllReviews,
  updateReviewStatus,
  type Review,
  type ReviewStatus,
} from "../../services/reviewService";

type DisplayStatus = "Published" | "Pending" | "Rejected";

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DisplayStatus>(
    "All",
  );
  const [ratingFilter, setRatingFilter] = useState<"All" | number>("All");

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const getDisplayStatus = (status: ReviewStatus): DisplayStatus => {
    if (status === "APPROVED") return "Published";
    if (status === "REJECTED") return "Rejected";
    return "Pending";
  };

  const loadReviews = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getAllReviews();

      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load reviews:", error);

      setError(
        "Unable to load reviews. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        review.user.name.toLowerCase().includes(searchText) ||
        review.user.email?.toLowerCase().includes(searchText) ||
        review.comment.toLowerCase().includes(searchText) ||
        review.id.toLowerCase().includes(searchText);

      const displayStatus = getDisplayStatus(review.status);

      const matchesStatus =
        statusFilter === "All" || displayStatus === statusFilter;

      const matchesRating =
        ratingFilter === "All" || review.rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const published = reviews.filter(
      (review) => review.status === "APPROVED",
    ).length;

    const pending = reviews.filter(
      (review) => review.status === "PENDING",
    ).length;

    const rejected = reviews.filter(
      (review) => review.status === "REJECTED",
    ).length;

    const average =
      total > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
        : 0;

    return {
      total,
      published,
      pending,
      rejected,
      average: average.toFixed(1),
    };
  }, [reviews]);

  const changeStatus = async (id: string, status: ReviewStatus) => {
    setUpdatingId(id);
    setError("");

    try {
      const updatedReview = await updateReviewStatus(id, status);

      setReviews((current) =>
        current.map((review) => (review.id === id ? updatedReview : review)),
      );

      if (selectedReview?.id === id) {
        setSelectedReview(updatedReview);
      }
    } catch (error) {
      console.error("Unable to update review status:", error);

      setError("Unable to update the review status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteReview(id);

      setReviews((current) => current.filter((review) => review.id !== id));

      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }
    } catch (error) {
      console.error("Unable to delete review:", error);

      setError("Unable to delete the review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const statusClasses = (status: DisplayStatus) => {
    if (status === "Published") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "Pending") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-red-50 text-red-700 border-red-200";
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                <MessageSquare className="h-4 w-4" />
                Customer Feedback
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Reviews
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage general customer reviews, monitor pharmacy ratings, and
                keep feedback organized.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => void loadReviews(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Rating
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {stats.average}
                  </span>

                  <div>
                    {renderStars(Math.round(Number(stats.average)))}

                    <p className="mt-1 text-xs text-slate-500">
                      {stats.total} total reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-semibold">Something went wrong</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Reviews
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Published</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.published}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.pending}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Rejected</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.rejected}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, email or review..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "All" | DisplayStatus)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(event) =>
                  setRatingFilter(
                    event.target.value === "All"
                      ? "All"
                      : Number(event.target.value),
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Customer Reviews</h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredReviews.length} review
              {filteredReviews.length !== 1 ? "s" : ""} shown
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading reviews...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">Customer</th>

                      <th className="px-5 py-4">Rating</th>

                      <th className="px-5 py-4">Review</th>

                      <th className="px-5 py-4">Status</th>

                      <th className="px-5 py-4">Date</th>

                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredReviews.map((review) => {
                      const displayStatus = getDisplayStatus(review.status);

                      const isUpdating = updatingId === review.id;

                      const isDeleting = deletingId === review.id;

                      return (
                        <tr
                          key={review.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {review.user.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {review.user.email}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}

                              <span className="text-sm font-semibold text-slate-700">
                                {review.rating}.0
                              </span>
                            </div>
                          </td>

                          <td className="max-w-[380px] px-5 py-4">
                            <p className="truncate text-sm text-slate-600">
                              {review.comment}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                                displayStatus,
                              )}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(review.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedReview(review)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                title="View review"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {review.status === "PENDING" && (
                                <button
                                  onClick={() =>
                                    void changeStatus(review.id, "APPROVED")
                                  }
                                  disabled={isUpdating}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Publish review"
                                >
                                  {isUpdating ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </button>
                              )}

                              {review.status === "PENDING" && (
                                <button
                                  onClick={() =>
                                    void changeStatus(review.id, "REJECTED")
                                  }
                                  disabled={isUpdating}
                                  className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Reject review"
                                >
                                  <Clock3 className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  void handleDeleteReview(review.id)
                                }
                                disabled={isDeleting}
                                className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete review"
                              >
                                {isDeleting ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
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

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredReviews.map((review) => {
                  const displayStatus = getDisplayStatus(review.status);

                  const isUpdating = updatingId === review.id;

                  const isDeleting = deletingId === review.id;

                  return (
                    <div key={review.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {review.user.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {review.user.email}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                            displayStatus,
                          )}`}
                        >
                          {displayStatus}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {renderStars(review.rating)}

                        <span className="text-sm font-semibold text-slate-700">
                          {review.rating}.0
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                          {formatDate(review.createdAt)}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600"
                            title="View review"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {review.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  void changeStatus(review.id, "APPROVED")
                                }
                                disabled={isUpdating}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 disabled:opacity-50"
                                title="Publish review"
                              >
                                {isUpdating ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  void changeStatus(review.id, "REJECTED")
                                }
                                disabled={isUpdating}
                                className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 disabled:opacity-50"
                                title="Reject review"
                              >
                                <Clock3 className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => void handleDeleteReview(review.id)}
                            disabled={isDeleting}
                            className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 disabled:opacity-50"
                            title="Delete review"
                          >
                            {isDeleting ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredReviews.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No reviews found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    There are no reviews matching your current search or
                    filters.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Review Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Customer Feedback
                </h2>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedReview.user.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedReview.user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(selectedReview.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Rating
                </p>

                <div className="mt-2 flex items-center gap-3">
                  {renderStars(selectedReview.rating)}

                  <span className="font-bold text-slate-900">
                    {selectedReview.rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer Comment
                </p>

                <div className="mt-2 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  {selectedReview.comment}
                </div>
              </div>

              <div>
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                    getDisplayStatus(selectedReview.status),
                  )}`}
                >
                  {getDisplayStatus(selectedReview.status)}
                </span>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                {selectedReview.status !== "APPROVED" && (
                  <button
                    onClick={() =>
                      void changeStatus(selectedReview.id, "APPROVED")
                    }
                    disabled={updatingId === selectedReview.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Publish
                  </button>
                )}

                {selectedReview.status !== "REJECTED" && (
                  <button
                    onClick={() =>
                      void changeStatus(selectedReview.id, "REJECTED")
                    }
                    disabled={updatingId === selectedReview.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                  >
                    <Clock3 className="h-4 w-4" />
                    Reject
                  </button>
                )}

                <button
                  onClick={() => void handleDeleteReview(selectedReview.id)}
                  disabled={deletingId === selectedReview.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;
