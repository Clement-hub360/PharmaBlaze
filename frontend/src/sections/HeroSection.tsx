import { ArrowRight, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-slate-950 text-white">
      {/* Large hero background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/pha-hero.jpg.jpg')",
        }}
      />

      {/* Dark image overlay */}
      <div className="absolute inset-0 -z-10 bg-slate-950/80" />

      {/* Left-to-right depth overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/55" />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-slate-950 to-transparent" />

      {/* Decorative green light */}
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-green-700/25 blur-[130px]" />
      <div className="pointer-events-none absolute right-[15%] top-24 -z-10 h-[300px] w-[300px] rounded-full bg-emerald-500/15 blur-[110px]" />

      {/* Hero content */}
      <div className="mx-auto flex min-h-[760px] max-w-7xl flex-col justify-center px-6 pb-28 pt-28 sm:px-8 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left side */}
          <div className="max-w-3xl">
            {/* Small badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 backdrop-blur-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                <ShieldCheck size={14} />
              </span>
              Trusted Pharmacy Care in Uyo
            </div>

            {/* Main heading */}
            <h1
              className="text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[78px] xl:text-[86px]"
              style={{
                fontFamily:
                  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              Your Health.
              <span className="block text-green-400">Our Priority.</span>
            </h1>

            {/* Description */}
            <p
              className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8"
              style={{
                fontFamily:
                  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              Quality pharmacy products, convenient access and trusted
              healthcare support for individuals and families in Uyo, Akwa Ibom.
            </p>

            {/* CTA buttons */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-green-700 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-green-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-2xl hover:shadow-green-900/40"
              >
                Explore Products
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400/50 hover:bg-white/10"
              >
                <Phone size={17} />
                Contact Us
              </Link>
            </div>

            {/* Location */}
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
              <MapPin size={17} className="shrink-0 text-green-400" />
              <span>235 Abak Rd, Uyo, Akwa Ibom, Nigeria</span>
            </div>
          </div>

          {/* Right side — premium pharmacy visual */}
          <div className="relative hidden lg:block">
            {/* Outer glow */}
            <div className="absolute -inset-6 rounded-[2.5rem] bg-green-500/10 blur-3xl" />

            {/* Main visual */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm">
              {/* Image */}
              <div
                className="relative h-[500px] bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/pharmablaze-pharmacy.jpg')",
                }}
              >
                {/* Image darkness */}
                <div className="absolute inset-0 bg-slate-950/35" />

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                {/* Bottom information */}
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <div className="mb-3 inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-green-300 backdrop-blur-md">
                    PHARMABLAZE PHARMACY
                  </div>

                  <h2 className="text-2xl font-bold text-white">
                    Healthcare you can trust.
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    Professional pharmacy support and everyday healthcare
                    essentials, right here in Uyo.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating availability card */}
            <div className="absolute -bottom-7 -left-7 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-900/30">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Pharmacy Care</p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Here when you need us
                  </p>
                </div>
              </div>
            </div>

            {/* Small floating accent */}
            <div className="absolute -right-5 top-12 h-16 w-16 rounded-2xl border border-green-400/20 bg-green-600/20 backdrop-blur-md" />
          </div>
        </div>
      </div>

      {/* Bottom feature bar */}
      <div className="absolute bottom-6 left-0 right-0 px-6 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-black/25 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-r lg:border-b-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              ✓
            </div>

            <span className="text-sm font-semibold text-slate-200">
              Trusted Pharmacy Service
            </span>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 lg:border-r lg:border-b-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              ✓
            </div>

            <span className="text-sm font-semibold text-slate-200">
              Quality Healthcare Products
            </span>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-r sm:border-b-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              ✓
            </div>

            <span className="text-sm font-semibold text-slate-200">
              Convenient Access
            </span>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              ✓
            </div>

            <span className="text-sm font-semibold text-slate-200">
              Healthcare Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
