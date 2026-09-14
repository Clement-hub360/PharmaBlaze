import { ArrowRight, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20">
      {/* Background Image Space */}
      <div className="absolute inset-0">
        {/* 
          BACKGROUND IMAGE SPACE
          Add your background image here later.
          Example:
          style={{ backgroundImage: "url('/images/pharmacy-bg.jpg')" }}
        */}
        <div className="absolute inset-0 bg-slate-900/90" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT SIDE - CTA CONTENT */}
          <div className="text-white">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              Pharmacy Care You Can Trust
            </span>

            <h2 className="text-4xl font-bold leading-tight sm:text-5xl">
              Your Health Deserves
              <span className="block text-emerald-400">The Right Care.</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Connect with Pharmablaze Pharmacy for convenient access to
              pharmacy products, helpful resources, and professional pharmacy
              support in Uyo.
            </p>

            {/* Location */}
            <div className="mt-8 flex items-start gap-3">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />

              <div>
                <p className="font-semibold text-white">
                  Visit Pharmablaze Pharmacy
                </p>

                <p className="mt-1 text-slate-300">
                  235 Abak Rd, Uyo 520104,
                  <br />
                  Akwa Ibom, Nigeria
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="mt-5 flex items-center gap-3">
              <Phone className="h-5 w-5 text-emerald-400" />

              <a
                href="tel:09128286533"
                className="font-medium text-slate-200 transition hover:text-emerald-400"
              >
                0912 828 6533
              </a>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Browse Products
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE - IMAGE SPACE */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
              {/* IMAGE PLACEHOLDER */}
              <div className="flex min-h-[360px] items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-800/60">
                <div className="px-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                    <MapPin className="h-8 w-8 text-emerald-400" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Pharmablaze Pharmacy
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">IMAGE SPACE</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Add your pharmacy image here later
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Information Card */}
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-5 shadow-xl">
              <p className="text-sm font-medium text-slate-500">Find Us</p>

              <p className="mt-1 font-bold text-slate-900">235 Abak Rd, Uyo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
