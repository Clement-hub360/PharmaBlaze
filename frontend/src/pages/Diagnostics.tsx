import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  HeartPulse,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Link } from "react-router-dom";

const healthChecks = [
  {
    title: "Health Screening",
    description:
      "Explore available health screening options and learn what information may be useful when discussing your health with a professional.",
    icon: HeartPulse,
    image: "/images/diagnostics-screening.jpg",
  },
  {
    title: "Health Measurements",
    description:
      "Learn about common health measurements and the importance of understanding results in the right professional context.",
    icon: Activity,
    image: "/images/diagnostics-measurements.jpg",
  },
  {
    title: "Pharmacy Guidance",
    description:
      "Get information about available pharmacy support and how to ask the right questions about your health needs.",
    icon: Stethoscope,
    image: "/images/diagnostics-guidance.jpg",
  },
];

const steps = [
  {
    number: "01",
    title: "Ask About Availability",
    description:
      "Contact Pharmablaze to confirm which health-check or screening services are currently available.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Understand the Process",
    description:
      "Our team can provide information about what to expect and any relevant preparation requirements.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Discuss Your Results",
    description:
      "Health measurements and screening information should be interpreted appropriately with qualified healthcare guidance.",
    icon: BadgeCheck,
  },
];

function Diagnostics() {
  return (
    <div className="bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="/images/diagnostics-background.jpg"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />

          <div className="absolute inset-0 bg-slate-950/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <Activity className="h-4 w-4" />
                Diagnostics & Health Checks
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Stay informed about your health.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Learn more about health screening, measurements, and pharmacy
                support available through Pharmablaze. Contact our team to
                confirm current availability and requirements.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Ask About Availability
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  to="/health"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Health Resources
                </Link>
              </div>
            </div>

            {/* HERO IMAGE SPACE */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
                <img
                  src="/images/diagnostics-pharmacy.jpg"
                  alt="Pharmablaze Pharmacy diagnostics"
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
                      Professional Support
                    </p>

                    <p className="text-xs text-slate-500">
                      Ask before you act.
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
              Explore Diagnostics
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Information that helps you understand your health journey.
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Health checks and screening can provide useful information, but
              results need to be understood in the right context. Pharmablaze is
              here to help you find the information and support you need.
            </p>
          </div>

          {/* HEALTH CHECK CARDS */}
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {healthChecks.map((check) => {
              const Icon = check.icon;

              return (
                <article
                  key={check.title}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={check.image}
                      alt={check.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-5 top-5 rounded-xl bg-white p-3 shadow-lg">
                      <Icon className="h-6 w-6 text-slate-800" />
                    </div>
                  </div>

                  <div className="p-7">
                    <h3 className="text-xl font-bold text-slate-950">
                      {check.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {check.description}
                    </p>

                    <Link
                      to="/contact"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:gap-3"
                    >
                      Ask About This
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* IMAGE SPACE */}
            <div className="overflow-hidden rounded-3xl bg-slate-200">
              <img
                src="/images/diagnostics-process.jpg"
                alt="Health screening process"
                className="h-[460px] w-full object-cover"
              />
            </div>

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Simple Process
              </span>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Start with a conversation.
              </h2>

              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                Before visiting for a health check or screening, contact the
                pharmacy to confirm what is currently available and whether any
                preparation is required.
              </p>

              <div className="mt-9 space-y-6">
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                        {step.number}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-slate-700" />

                          <h3 className="font-bold text-slate-950">
                            {step.title}
                          </h3>
                        </div>

                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH / INFORMATION */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Search className="h-7 w-7 text-slate-800" />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-slate-950">
                Need information before visiting?
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Contact Pharmablaze to ask about available health checks,
                screening information, pharmacy products, or other services.
              </p>

              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Contact Pharmablaze
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT NOTICE */}
      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white">
            Important Health Notice
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Information on this page is provided for general educational
            purposes. A health screening or measurement does not by itself
            establish a diagnosis. Personal health concerns and results should
            be discussed with an appropriately qualified healthcare
            professional.
          </p>
        </div>
      </section>

      {/* LOCATION */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <div className="grid lg:grid-cols-2">
              {/* IMAGE SPACE */}
              <div className="min-h-[340px] bg-slate-200">
                <img
                  src="/images/diagnostics-location.jpg"
                  alt="Pharmablaze Pharmacy location"
                  className="h-full min-h-[340px] w-full object-cover"
                />
              </div>

              <div className="flex items-center p-8 sm:p-12">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    <MapPin className="h-6 w-6 text-slate-800" />
                  </div>

                  <h2 className="mt-6 text-3xl font-bold text-slate-950">
                    Visit Pharmablaze
                  </h2>

                  <p className="mt-4 leading-7 text-slate-600">
                    Contact the pharmacy or visit our location in Uyo, Akwa
                    Ibom.
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
            Have questions about our health services?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Reach out to Pharmablaze Pharmacy to confirm available services and
            get the information you need before visiting.
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

export default Diagnostics;
