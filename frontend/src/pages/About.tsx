import {
  ArrowRight,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          ABOUT HERO
          ===================================================== */}

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
        {/* BACKGROUND IMAGE SPACE */}

        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: "url('/images/about-background.jpg')",
          }}
        />

        {/* DARK OVERLAY */}

        <div className="absolute inset-0 bg-slate-950/80" />

        {/* DECORATIVE LIGHT */}

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* HERO TEXT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                <HeartPulse className="h-4 w-4" />
                About Pharmablaze Pharmacy
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Pharmacy Care
                <span className="block text-emerald-400">With Purpose.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Pharmablaze Pharmacy is a pharmacy based in Uyo, Akwa Ibom,
                focused on making access to pharmacy products and helpful health
                information more convenient for the community.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
                >
                  Explore Our Services
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

            {/* HERO IMAGE SPACE */}

            <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/about-pharmacy.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-slate-950/35" />

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
                      Uyo, Akwa Ibom
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
          ===================================================== */}

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* IMAGE */}

            <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl">
              {/* IMAGE SPACE */}

              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/about-team.jpg')",
                }}
              />

              {/* IMAGE LABEL */}

              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/95 px-5 py-4 shadow-xl backdrop-blur-sm">
                <p className="text-sm font-black text-slate-950">
                  Pharmablaze Pharmacy
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Serving Uyo, Akwa Ibom
                </p>
              </div>
            </div>

            {/* TEXT */}

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                Who We Are
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                More than a pharmacy.
                <span className="block text-emerald-600">
                  A place you can turn to.
                </span>
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                Pharmablaze Pharmacy is located at 235 Abak Road, Uyo, Akwa
                Ibom. Our website is being built to make information, pharmacy
                products, and ways to connect with the pharmacy easier to
                access.
              </p>

              <p className="mt-5 leading-8 text-slate-600">
                Whether you are browsing pharmacy products, exploring wellness
                information, or looking for a convenient way to contact us, the
                Pharmablaze experience is designed around simplicity and
                accessibility.
              </p>

              {/* LOCATION */}

              <div className="mt-8 flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-black text-slate-950">Our Location</p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
          ===================================================== */}

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
              What Matters To Us
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Built around people.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Every part of the Pharmablaze website is designed to make the
              experience clearer, easier, and more convenient for visitors.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* VALUE 1 */}

            <div className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-7 text-2xl font-black text-slate-950">
                People First
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                We want visitors to find the information and pharmacy resources
                they need without unnecessary complexity.
              </p>
            </div>

            {/* VALUE 2 */}

            <div className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h3 className="mt-7 text-2xl font-black text-slate-950">
                Trust & Clarity
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                We aim to present pharmacy information clearly and avoid
                confusing or misleading health claims.
              </p>
            </div>

            {/* VALUE 3 */}

            <div className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <Stethoscope className="h-6 w-6" />
              </div>

              <h3 className="mt-7 text-2xl font-black text-slate-950">
                Helpful Information
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Our health resources are intended to help visitors learn more
                while encouraging appropriate professional guidance when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PHARMACY EXPERIENCE
          ===================================================== */}

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950">
            <div className="grid lg:grid-cols-2">
              {/* TEXT */}

              <div className="p-8 text-white sm:p-12 lg:p-16">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                  The Pharmablaze Experience
                </p>

                <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                  Simple.
                  <span className="block text-emerald-400">Clear.</span>
                  Convenient.
                </h2>

                <p className="mt-6 leading-8 text-slate-300">
                  We are building Pharmablaze as a modern digital front door for
                  the pharmacy — helping visitors discover products, learn, ask
                  questions, and connect with the pharmacy.
                </p>

                <div className="mt-8">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white transition hover:bg-emerald-600"
                  >
                    Browse Products
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* IMAGE */}

              <div className="relative min-h-[420px]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/images/pharmacy-interior.jpg')",
                  }}
                />

                <div className="absolute inset-0 bg-slate-950/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION CTA
          ===================================================== */}

      <section className="relative overflow-hidden bg-emerald-600 py-16 text-white lg:py-20">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-950/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
            <img
              src="/images/pharmablaze-logo-transparent.png"
              alt="Pharmablaze Pharmacy"
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="mt-7 text-3xl font-black sm:text-4xl">
            Looking for Pharmablaze Pharmacy?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-50">
            Visit us at 235 Abak Road, Uyo, Akwa Ibom, or contact the pharmacy
            before your visit.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-emerald-700 shadow-lg transition hover:bg-slate-50"
            >
              Contact Pharmablaze
              <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Pharmablaze+Pharmacy+235+Abak+Road+Uyo+Akwa+Ibom"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <MapPin className="h-5 w-5" />
              View Location
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
