import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

type ContactForm = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to send your message. Please try again.",
        );
      }

      setSubmitted(true);

      setForm({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          PAGE HERO
          ===================================================== */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/contact-background.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-slate-950/80" />

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              <MessageCircle className="h-4 w-4" />
              We're here to help
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Let's Talk About
              <span className="block text-emerald-400">
                Your Pharmacy Needs.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Have a question, need assistance, or want to learn more about
              Pharmablaze Pharmacy? Reach out to our team.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT INFORMATION
          ===================================================== */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="tel:09128286533"
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <Phone className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                Call Us
              </p>

              <h2 className="mt-2 text-lg font-black text-slate-950">
                0912 828 6533
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Speak with Pharmablaze Pharmacy.
              </p>
            </a>

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <MapPin className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                Visit Us
              </p>

              <h2 className="mt-2 text-lg font-black text-slate-950">
                Uyo, Akwa Ibom
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom.
              </p>
            </div>

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <Mail className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                Email
              </p>

              <h2 className="mt-2 break-all text-lg font-black text-slate-950">
                Contact Pharmablaze
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Use the contact form below for enquiries.
              </p>
            </div>

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <MessageCircle className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                Need Help?
              </p>

              <h2 className="mt-2 text-lg font-black text-slate-950">
                Contact Our Team
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Send us a message and we'll assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT FORM + IMAGE
          ===================================================== */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
            <div className="relative min-h-[500px] overflow-hidden bg-slate-900">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/contact-pharmacy.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-slate-950/75" />

              <div className="relative flex h-full flex-col justify-between p-8 text-white sm:p-12">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
                    <img
                      src="/images/pharmablaze-logo-transparent.png"
                      alt="Pharmablaze Pharmacy"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <h2 className="mt-8 max-w-md text-4xl font-black leading-tight">
                    Your trusted pharmacy in Uyo.
                  </h2>

                  <p className="mt-5 max-w-md leading-7 text-slate-300">
                    Pharmablaze Pharmacy is located on Abak Road, Uyo, Akwa
                    Ibom. Contact us for pharmacy-related enquiries and
                    assistance.
                  </p>
                </div>

                <div className="mt-12 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-bold">Pharmablaze Pharmacy</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                Send a Message
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                How can we help?
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Complete the form below and provide as much detail as possible
                about your enquiry.
              </p>

              {submitted ? (
                <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <ShieldCheck className="h-7 w-7" />
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-slate-950">
                    Message Sent Successfully
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    Thank you for contacting Pharmablaze Pharmacy. Your message
                    has been received and our team can now review it.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setError("");
                    }}
                    className="mt-6 font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium leading-6 text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-bold text-slate-800"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="0912 828 6533"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-bold text-slate-800"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Subject
                    </label>

                    <select
                      id="subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value="" disabled>
                        Select an enquiry type
                      </option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Product Enquiry">Product Enquiry</option>
                      <option value="Pharmacy Services">
                        Pharmacy Services
                      </option>
                      <option value="Order Assistance">Order Assistance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending Message..." : "Send Message"}

                    <Send className="h-5 w-5" />
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-400">
                    Please avoid including unnecessary sensitive medical or
                    personal information in this form.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION / MAP AREA
          ===================================================== */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                Find Us
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                Visit Pharmablaze Pharmacy
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Find us at 235 Abak Road in Uyo, Akwa Ibom. Use the location
                tools below to plan your visit.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">Address</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Phone className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">Phone</p>
                    <p className="mt-1 text-sm text-slate-500">0912 828 6533</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">Opening Hours</p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Please contact the pharmacy directly to confirm current
                      opening hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/pharmablaze-map.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-slate-900/10" />

              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                    <Navigation className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-950">
                    Pharmablaze Pharmacy
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    235 Abak Rd, Uyo, Akwa Ibom.
                  </p>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Pharmablaze+Pharmacy+235+Abak+Road+Uyo+Akwa+Ibom"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Open in Maps
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}
      <section className="relative overflow-hidden bg-emerald-600 py-16 text-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-slate-950/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
            <img
              src="/images/pharmablaze-logo-transparent.png"
              alt="Pharmablaze Pharmacy"
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="mt-7 text-3xl font-black sm:text-4xl">
            We're here when you need us.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-50">
            Have another question? Explore our pharmacy services or browse our
            products.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-emerald-700 shadow-lg transition hover:bg-slate-50"
            >
              Explore Services
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
