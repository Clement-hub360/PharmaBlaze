import {
  ArrowUpRight,
  ChevronRight,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      {/* =====================================================
          BACKGROUND IMAGE
          ===================================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage: "url('/images/pharmacy-footer-bg.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-slate-950/90" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -left-40 bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* =====================================================
          MAIN CONTAINER
          ===================================================== */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* ===================================================
            BRAND + IMAGE AREA
            =================================================== */}
        <div className="border-b border-white/10 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* BRAND */}
            <div>
              <div className="flex items-center gap-4">
                {/* REAL LOGO */}
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
                  <img
                    src="/images/pharmablaze-logo-transparent.png"
                    alt="Pharmablaze Pharmacy"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Pharmablaze
                  </h2>

                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                    Pharmacy
                  </p>
                </div>
              </div>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Your trusted pharmacy in Uyo. Explore pharmacy products,
                discover useful health resources, and connect with Pharmablaze
                Pharmacy when you need us.
              </p>

              {/* Trust badge */}
              <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />

                <span className="text-sm font-semibold text-slate-300">
                  Your Health. Our Priority.
                </span>
              </div>
            </div>

            {/* =================================================
                PHARMACY IMAGE SPACE
                ================================================= */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl">
                <div
                  className="relative flex min-h-[330px] items-end overflow-hidden rounded-[1.5rem] bg-slate-900 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/images/pharmablaze-pharmacy.jpg')",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="relative z-10 p-7">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm">
                      <HeartPulse className="h-6 w-6 text-emerald-400" />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                      Visit Pharmablaze
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      Your Local Pharmacy
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      235 Abak Rd, Uyo, Akwa Ibom
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating location card */}
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white px-5 py-4 text-slate-900 shadow-2xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Navigation className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </p>

                    <p className="text-sm font-bold">235 Abak Rd, Uyo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            CONTACT STRIP
            =================================================== */}
        <div className="border-b border-white/10 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* PHONE */}
            <a
              href="tel:09128286533"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 transition group-hover:bg-emerald-500">
                <Phone className="h-5 w-5 text-emerald-400 group-hover:text-white" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Call Us
                </p>

                <p className="mt-1 font-semibold text-slate-200">
                  0912 828 6533
                </p>
              </div>
            </a>

            {/* LOCATION */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <MapPin className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Find Us
                </p>

                <p className="mt-1 font-semibold text-slate-200">
                  235 Abak Rd, Uyo
                </p>
              </div>
            </div>

            {/* CONTACT */}
            <Link
              to="/contact"
              className="group flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 transition duration-300 hover:bg-emerald-500"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20">
                <MessageCircle className="h-5 w-5 text-emerald-300 group-hover:text-white" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 group-hover:text-white/70">
                  Need Help?
                </p>

                <p className="mt-1 font-semibold">Contact Pharmablaze</p>
              </div>

              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
            =================================================== */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* EXPLORE */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
              Explore
            </h3>

            <ul className="mt-7 space-y-4">
              <li>
                <Link
                  to="/"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/products"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Products
                </Link>
              </li>

              <li>
                <Link
                  to="/services"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Pharmacy Services
                </Link>
              </li>
            </ul>
          </div>

          {/* HEALTH */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
              Health
            </h3>

            <ul className="mt-7 space-y-4">
              <li>
                <Link
                  to="/health"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Health Resources
                </Link>
              </li>

              <li>
                <Link
                  to="/health/wellness"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Wellness Tips
                </Link>
              </li>

              <li>
                <Link
                  to="/health/medication"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Medication Information
                </Link>
              </li>

              <li>
                <Link
                  to="/health/articles"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Health Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
              Support
            </h3>

            <ul className="mt-7 space-y-4">
              <li>
                <Link
                  to="/contact"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/reviews"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Customer Reviews
                </Link>
              </li>

              <li>
                <Link
                  to="/faq"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Frequently Asked Questions
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="group flex items-center text-slate-400 hover:text-emerald-400"
                >
                  <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
              Connect
            </h3>

            <div className="mt-7">
              <p className="text-sm leading-6 text-slate-400">
                Stay connected with Pharmablaze Pharmacy for updates, pharmacy
                information, and useful health resources.
              </p>

              {/* EMAIL PLACEHOLDER */}
              <div className="mt-6 flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-400" />

                <span className="text-sm text-slate-400">
                  Email coming soon
                </span>
              </div>

              {/* SOCIAL PLACEHOLDERS */}
              <div className="mt-6 flex gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold transition hover:border-emerald-400 hover:bg-emerald-500"
                >
                  f
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-bold transition hover:border-emerald-400 hover:bg-emerald-500"
                >
                  ◎
                </a>

                <a
                  href="#"
                  aria-label="WhatsApp"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-emerald-400 hover:bg-emerald-500"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            FINAL CTA
            =================================================== */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-white/[0.03] to-cyan-500/10">
          <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                Pharmablaze Pharmacy
              </p>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                Better care starts with staying informed.
              </h3>
            </div>

            <Link
              to="/health"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
            >
              Explore Health Resources
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ===================================================
            COPYRIGHT
            =================================================== */}
        <div className="border-t border-white/10 py-7">
          <div className="flex flex-col gap-5 text-sm md:flex-row md:items-center md:justify-between">
            <p className="text-slate-500">
              © {new Date().getFullYear()} Pharmablaze Pharmacy. All rights
              reserved.
            </p>

            <div className="flex flex-wrap gap-5">
              <Link
                to="/privacy"
                className="text-slate-500 transition hover:text-emerald-400"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="text-slate-500 transition hover:text-emerald-400"
              >
                Terms
              </Link>

              <Link
                to="/contact"
                className="text-slate-500 transition hover:text-emerald-400"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
