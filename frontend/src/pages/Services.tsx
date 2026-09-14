import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  HeartPulse,
  MapPin,
  MessageCircle,
  Package,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Link } from "react-router-dom";

const services = [
  {
    title: "Pharmacy Products",
    description:
      "Browse pharmacy products and discover items available through the Pharmablaze catalogue.",
    icon: Package,
    image: "/images/service-products.jpg",
  },
  {
    title: "Medication Support",
    description:
      "Get information and assistance related to medication and pharmacy products from the pharmacy team.",
    icon: Pill,
    image: "/images/service-medication.jpg",
  },
  {
    title: "Health & Wellness",
    description:
      "Explore helpful health and wellness resources designed to make everyday information easier to access.",
    icon: HeartPulse,
    image: "/images/service-wellness.jpg",
  },
  {
    title: "Pharmacy Enquiries",
    description:
      "Have a question about a product or pharmacy service? Contact Pharmablaze for assistance.",
    icon: MessageCircle,
    image: "/images/service-enquiries.jpg",
  },
  {
    title: "Product Assistance",
    description:
      "Need help finding a pharmacy product? Our website provides convenient ways to explore the catalogue.",
    icon: Search,
    image: "/images/service-assistance.jpg",
  },
  {
    title: "Pharmacy Information",
    description:
      "Find important information about Pharmablaze Pharmacy, including our location and ways to contact us.",
    icon: ClipboardList,
    image: "/images/service-information.jpg",
  },
];

function Services() {
  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
        {/* BACKGROUND IMAGE SPACE */}

        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: "url('/images/services-background.jpg')",
          }}
        />

        {/* OVERLAY */}

        <div className="absolute inset-0 bg-slate-950/80" />

        {/* DECORATIVE LIGHT */}

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* TEXT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                <Stethoscope className="h-4 w-4" />
                Pharmablaze Services
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Pharmacy Support
                <span className="block text-emerald-400">Made Simpler.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Explore the pharmacy products, information and support available
                through Pharmablaze Pharmacy in Uyo, Akwa Ibom.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
                >
                  Explore Products
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* HERO IMAGE */}

            <div className="relative min-h-[450px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/services-pharmacy.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-slate-950/30" />

              {/* LOGO CARD */}

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
                    <img
                      src="/images/pharmablaze-logo-transparent.png"
                      alt="Pharmablaze Pharmacy"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-lg font-black text-white">
                      Pharmablaze Pharmacy
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      Pharmacy support in Uyo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
          ===================================================== */}

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
            What We Provide
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Everything starts with
            <span className="text-emerald-600"> better access.</span>
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Pharmablaze is being designed to make it easier for customers to
            discover pharmacy products, access useful information and connect
            with the pharmacy.
          </p>
        </div>
      </section>

      {/* =====================================================
          SERVICES GRID
          ===================================================== */}

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* SERVICE IMAGE */}

                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${service.image}')`,
                      }}
                    />

                    <div className="absolute inset-0 bg-slate-950/20" />

                    {/* ICON */}

                    <div className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-xl">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-7">
                    <h3 className="text-2xl font-black text-slate-950">
                      {service.title}
                    </h3>

                    <p className="mt-4 leading-7 text-slate-600">
                      {service.description}
                    </p>

                    <Link
                      to="/contact"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-black text-emerald-600 transition hover:text-emerald-700"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY PHARMACY SUPPORT MATTERS
          ===================================================== */}

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* IMAGE */}

            <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/pharmacy-support.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-slate-950/15" />
            </div>

            {/* TEXT */}

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                Designed For Convenience
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                A better way to
                <span className="block text-emerald-600">
                  connect with your pharmacy.
                </span>
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                A modern pharmacy website should make it easy for visitors to
                find what they are looking for without getting lost in
                complicated menus.
              </p>

              <div className="mt-8 space-y-5">
                {/* FEATURE 1 */}

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <BadgeCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-950">
                      Clear Information
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Important pharmacy information is presented clearly and
                      simply.
                    </p>
                  </div>
                </div>

                {/* FEATURE 2 */}

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Search className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-950">
                      Easier Discovery
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Browse products and resources through a structured digital
                      experience.
                    </p>
                  </div>
                </div>

                {/* FEATURE 3 */}

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageCircle className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-950">
                      Easy Communication
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Contact Pharmablaze when you need assistance or have a
                      pharmacy-related enquiry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION CARD
          ===================================================== */}

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <MapPin className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-emerald-600">
                    Visit Pharmablaze
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Located in Uyo, Akwa Ibom
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom.
                  </p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Pharmablaze+Pharmacy+235+Abak+Road+Uyo+Akwa+Ibom"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-slate-800"
              >
                <MapPin className="h-5 w-5" />
                View Location
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          IMPORTANT NOTICE
          ===================================================== */}

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Important Information
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Information on this website is intended to help visitors
                  navigate Pharmablaze Pharmacy and its available resources.
                  Product availability, pricing, pharmacy requirements and
                  specific services should be confirmed directly with the
                  pharmacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
            <img
              src="/images/pharmablaze-logo-transparent.png"
              alt="Pharmablaze Pharmacy"
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="mt-7 text-3xl font-black sm:text-4xl">
            Need pharmacy assistance?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Explore our products or contact Pharmablaze Pharmacy in Uyo for more
            information.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 font-bold text-white transition hover:bg-emerald-600"
            >
              Browse Products
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;
