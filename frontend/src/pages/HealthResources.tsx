import {
  ArrowRight,
  BookOpen,
  HeartPulse,
  MapPin,
  MessageCircle,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { Link } from "react-router-dom";

const resources = [
  {
    title: "Everyday Health & Wellness",
    description:
      "Explore practical information and simple wellness ideas to support healthier everyday habits.",
    icon: HeartPulse,
    image: "/images/health-wellness.jpg",
    link: "/health/wellness",
  },
  {
    title: "Medication Information",
    description:
      "Find general educational information about medicines, responsible medication use, and pharmacy support.",
    icon: Pill,
    image: "/images/health-medication.jpg",
    link: "/health/medication",
  },
  {
    title: "Wellness Tips",
    description:
      "Discover useful health and wellness topics covering everyday routines, prevention, and healthy living.",
    icon: Sparkles,
    image: "/images/health-tips.jpg",
    link: "/health/wellness",
  },
];

const topics = [
  {
    title: "Medication Support",
    description:
      "Have questions about a pharmacy product or medication? Speak with the Pharmablaze team for appropriate guidance.",
    icon: Pill,
  },
  {
    title: "Healthy Living",
    description:
      "Learn more about everyday wellness habits and practical ways to make informed health choices.",
    icon: HeartPulse,
  },
  {
    title: "Professional Guidance",
    description:
      "Educational resources can help you prepare questions, but individual health concerns should be discussed with a qualified professional.",
    icon: Stethoscope,
  },
];

function HealthResources() {
  return (
    <div className="bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="/images/health-background.jpg"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-slate-950/75" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <BookOpen className="h-4 w-4" />
                Health & Wellness Resources
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Information to help you make informed health choices.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Explore helpful health, wellness, and medication information
                from Pharmablaze Pharmacy. Our resource hub is designed to make
                everyday health information easier to access.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/health/wellness"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Explore Resources
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Contact Pharmablaze
                </Link>
              </div>
            </div>

            {/* IMAGE SPACE */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
                <img
                  src="/images/health-pharmacy.jpg"
                  alt="Pharmablaze Pharmacy health resources"
                  className="h-[360px] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <ShieldCheck className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Trusted Information
                    </p>
                    <p className="text-xs text-slate-500">
                      Learn. Ask. Make informed choices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Explore Our Resources
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Your health questions deserve useful information.
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Browse our health and wellness categories for educational
              information that can help you understand common health topics and
              prepare for conversations with healthcare professionals.
            </p>
          </div>

          {/* RESOURCE CARDS */}
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {resources.map((resource) => {
              const Icon = resource.icon;

              return (
                <article
                  key={resource.title}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-5 top-5 rounded-xl bg-white p-3 shadow-lg">
                      <Icon className="h-6 w-6 text-slate-800" />
                    </div>
                  </div>

                  <div className="p-7">
                    <h3 className="text-xl font-bold text-slate-950">
                      {resource.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {resource.description}
                    </p>

                    <Link
                      to={resource.link}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:gap-3"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEARCH / DISCOVER */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-7 w-7 text-slate-800" />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-slate-950">
                Looking for a health topic?
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Search and browse our growing collection of educational health
                resources.
              </p>

              <div className="mx-auto mt-8 flex max-w-xl items-center rounded-2xl border border-slate-300 bg-white p-2 shadow-sm">
                <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search health resources..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Search
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Search functionality can be connected to the backend later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Health Support
              </span>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Resources built around better conversations.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Good health information can help you ask better questions and
                understand what to discuss with a qualified healthcare
                professional.
              </p>

              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Talk to Pharmablaze
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid gap-5">
              {topics.map((topic) => {
                const Icon = topic.icon;

                return (
                  <div
                    key={topic.title}
                    className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Icon className="h-6 w-6 text-slate-800" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        {topic.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="bg-slate-950 py-14">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white">
            Important Health Information Notice
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            The information provided through this resource hub is intended for
            general educational purposes only. It is not a substitute for
            diagnosis, treatment, or individual medical advice. For personal
            health concerns, medication questions, or emergencies, consult an
            appropriately qualified healthcare professional.
          </p>
        </div>
      </section>

      {/* LOCATION CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <div className="grid lg:grid-cols-2">
              {/* IMAGE SPACE */}
              <div className="min-h-[320px] bg-slate-200">
                <img
                  src="/images/health-location.jpg"
                  alt="Pharmablaze Pharmacy location"
                  className="h-full min-h-[320px] w-full object-cover"
                />
              </div>

              <div className="flex items-center p-8 sm:p-12">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    <MapPin className="h-6 w-6 text-slate-800" />
                  </div>

                  <h2 className="mt-6 text-3xl font-bold text-slate-950">
                    Visit Pharmablaze Pharmacy
                  </h2>

                  <p className="mt-4 leading-7 text-slate-600">
                    Find us at our pharmacy location in Uyo, Akwa Ibom.
                  </p>

                  <p className="mt-4 font-semibold text-slate-900">
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
            Have a question we haven't answered?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Contact Pharmablaze Pharmacy for information about our pharmacy
            products, services, and available support.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HealthResources;
