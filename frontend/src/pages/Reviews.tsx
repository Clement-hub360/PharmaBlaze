import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Quote,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  createReview,
  getApprovedReviews,
  type Review,
} from "../services/reviewService";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

const trustPoints = [
  {
    title: "Customer Focus",
    description:
      "We aim to make every pharmacy interaction clear, respectful, and helpful.",
    icon: Heart,
  },
  {
    title: "Professional Support",
    description:
      "Our website is designed to help customers find information and know when to seek professional guidance.",
    icon: ShieldCheck,
  },
  {
    title: "Local Convenience",
    description:
      "Visit us at our Abak Road location in Uyo for your pharmacy enquiries and needs.",
    icon: MapPin,
  },
];

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pharmablaze_user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as StoredUser;
      setUser(parsedUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoadingReviews(true);
        setReviewsError("");

        const approvedReviews = await getApprovedReviews();

        setReviews(approvedReviews);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviewsError(
          "We could not load customer reviews right now. Please try again later.",
        );
      } finally {
        setLoadingReviews(false);
      }
    }

    void loadReviews();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return "0.0";
    }

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0,
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitMessage("");
    setSubmitError("");

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      setSubmitError("Please tell us about your experience.");
      return;
    }

    if (trimmedComment.length < 10) {
      setSubmitError(
        "Please write at least 10 characters about your experience.",
      );
      return;
    }

    if (trimmedComment.length > 1000) {
      setSubmitError(
        "Your review is too long. Please keep it under 1000 characters.",
      );
      return;
    }

    if (!user) {
      setSubmitError("Please sign in before submitting a review.");
      return;
    }

    try {
      setSubmitting(true);

      await createReview({
        rating,
        comment: trimmedComment,
      });

      setComment("");
      setRating(5);

      setSubmitMessage(
        "Thank you! Your review has been submitted and is awaiting approval.",
      );
    } catch (error) {
      console.error("Failed to submit review:", error);

      setSubmitError(
        "We could not submit your review right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatReviewDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Customer Review";
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="/images/reviews-background.jpg"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <Star className="h-4 w-4 fill-current" />
                Customer Reviews
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Your experience matters to us.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Discover what customers have shared about their experiences with
                Pharmablaze Pharmacy and share your own experience with our
                team.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#reviews"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Read Reviews
                  <ArrowRight className="h-5 w-5" />
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
                <img
                  src="/images/reviews-pharmacy.jpg"
                  alt="Pharmablaze Pharmacy"
                  className="h-[360px] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Users className="h-6 w-6 text-slate-700" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Customer Experience
                    </p>
                    <p className="text-xs text-slate-500">
                      Your feedback helps us improve.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RATING SUMMARY */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-6 w-6 fill-current text-slate-900"
                  />
                ))}
              </div>

              <p className="mt-5 text-4xl font-bold text-slate-950">4.6</p>

              <p className="mt-2 text-sm text-slate-600">
                Google rating currently shown for Pharmablaze
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <MessageCircle className="h-6 w-6 text-slate-800" />
              </div>

              <p className="mt-5 text-4xl font-bold text-slate-950">
                {loadingReviews ? "..." : reviews.length}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Published website reviews
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <BadgeCheck className="h-6 w-6 text-slate-800" />
              </div>

              <p className="mt-5 text-4xl font-bold text-slate-950">
                {loadingReviews ? "..." : averageRating}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Average website review rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Customer Feedback
            </span>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              What customers are saying
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Real feedback from customers who have shared their experience with
              Pharmablaze Pharmacy.
            </p>
          </div>

          {reviewsError && (
            <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-6">{reviewsError}</p>
            </div>
          )}

          {loadingReviews ? (
            <div className="flex justify-center py-16">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading customer reviews...</span>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <MessageCircle className="h-7 w-7 text-slate-700" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-950">
                No published reviews yet
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Be one of the first customers to share your experience with
                Pharmablaze Pharmacy.
              </p>
            </div>
          ) : (
            <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Quote className="absolute right-7 top-7 h-9 w-9 text-slate-200" />

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Number(review.rating)
                            ? "fill-current text-slate-900"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-7 text-base leading-8 text-slate-600">
                    “{review.comment}”
                  </p>

                  <div className="mt-7 border-t border-slate-200 pt-5">
                    <p className="font-bold text-slate-950">
                      {review.user?.name || "Pharmablaze Customer"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* WRITE A REVIEW */}
          <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:p-10">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Share Your Experience
              </span>

              <h3 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
                Tell us about your experience
              </h3>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                Your feedback helps us understand what we are doing well and
                where we can improve.
              </p>
            </div>

            {!user ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-sm leading-6 text-slate-600">
                  You need to be signed in to submit a customer review.
                </p>

                <Link
                  to="/login"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                >
                  Sign In to Review
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitReview}
                className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    Your rating
                  </label>

                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`Rate ${star} out of 5`}
                        className="rounded-lg p-1 transition hover:bg-slate-100"
                      >
                        <Star
                          className={`h-8 w-8 transition ${
                            star <= rating
                              ? "fill-current text-slate-900"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {rating} out of 5 stars
                  </p>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="review-comment"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Your review
                  </label>

                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={6}
                    maxLength={1000}
                    placeholder="Tell us about your experience with Pharmablaze Pharmacy..."
                    className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />

                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-slate-500">
                      {comment.length}/1000
                    </span>
                  </div>
                </div>

                {submitMessage && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-sm leading-6">{submitMessage}</p>
                  </div>
                )}

                {submitError && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-sm leading-6">{submitError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    <>
                      Submit Review
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Reviews are checked by our team before they are published.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* IMAGE + MESSAGE */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-2">
            <div className="min-h-[400px] bg-slate-200">
              <img
                src="/images/reviews-team.jpg"
                alt="Pharmablaze Pharmacy team"
                className="h-full min-h-[400px] w-full object-cover"
              />
            </div>

            <div className="flex items-center p-8 sm:p-12 lg:p-16">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <MessageCircle className="h-6 w-6 text-slate-800" />
                </div>

                <h2 className="mt-6 text-3xl font-bold text-slate-950 sm:text-4xl">
                  Have feedback for us?
                </h2>

                <p className="mt-5 leading-8 text-slate-600">
                  We value feedback from customers. If you have a question,
                  suggestion, or experience you would like to share, reach out
                  to the Pharmablaze team.
                </p>

                <Link
                  to="/contact"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                >
                  Send Us a Message
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST POINTS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Why Customers Matter
            </span>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Built around a better pharmacy experience.
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div
                  key={point.title}
                  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-6 w-6 text-slate-800" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-950">
                    {point.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid lg:grid-cols-2">
              <div className="min-h-[340px] bg-slate-200">
                <img
                  src="/images/reviews-location.jpg"
                  alt="Pharmablaze Pharmacy location"
                  className="h-full min-h-[340px] w-full object-cover"
                />
              </div>

              <div className="flex items-center p-8 sm:p-12">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <MapPin className="h-6 w-6 text-slate-800" />
                  </div>

                  <h2 className="mt-6 text-3xl font-bold text-slate-950">
                    Visit Pharmablaze Pharmacy
                  </h2>

                  <p className="mt-4 leading-7 text-slate-600">
                    We are located on Abak Road in Uyo, Akwa Ibom.
                  </p>

                  <p className="mt-4 font-semibold leading-7 text-slate-900">
                    2V56+V39, 235 Abak Rd,
                    <br />
                    Uyo 520104, Akwa Ibom
                  </p>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Pharmablaze%20Pharmacy%20235%20Abak%20Rd%20Uyo%20Akwa%20Ibom"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Get Directions
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-5 w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              src="/images/pharmablaze-logo-transparent.png"
              alt="Pharmablaze Pharmacy"
              className="h-14 w-auto object-contain"
            />
          </div>

          <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
            Ready to visit Pharmablaze?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Explore our pharmacy products and services or contact our team with
            your questions.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Products
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reviews;
