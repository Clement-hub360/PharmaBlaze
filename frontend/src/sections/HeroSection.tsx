import { ArrowRight, Phone, ShieldCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* LEFT SIDE - HERO CONTENT */}
        <div className="max-w-2xl">
          {/* SMALL BADGE */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <ShieldCheck size={17} />
            Your trusted pharmacy in Uyo
          </div>

          {/* MAIN HEADING */}
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Your Health.
            <span className="block text-green-700">Our Priority.</span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Welcome to Pharmablaze Pharmacy. We are committed to providing
            convenient access to pharmacy products and trusted healthcare
            support for individuals and families in Uyo, Akwa Ibom.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-4 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 hover:shadow-xl"
            >
              Explore Products
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              <Phone size={18} />
              Contact Us
            </Link>
          </div>

          {/* LOCATION */}
          <div className="mt-8 flex items-start gap-3 text-sm text-slate-500">
            <MapPin size={19} className="mt-0.5 shrink-0 text-green-700" />

            <span>235 Abak Rd, Uyo, Akwa Ibom, Nigeria</span>
          </div>
        </div>

        {/* RIGHT SIDE - HERO IMAGE AREA */}
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-100 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-100 blur-2xl" />

          {/* IMAGE CONTAINER */}
          <div className="relative min-h-[450px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl lg:min-h-[540px]">
            {/* 
              HERO IMAGE SPACE

              Place your hero image here later.

              Recommended image:
              - Pharmacy interior
              - Pharmacist assisting a customer
              - Professional healthcare scene
              - High-quality, bright image
              - Landscape orientation
            */}

            <div className="flex h-full min-h-[450px] items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-10 text-center lg:min-h-[540px]">
              <div className="max-w-sm">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-700 text-3xl font-bold text-white shadow-lg">
                  P
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Hero Image Area
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Your Pharmablaze pharmacy or healthcare image will be placed
                  here.
                </p>
              </div>
            </div>
          </div>

          {/* FLOATING INFO CARD */}
          <div className="absolute -bottom-6 left-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl sm:left-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Pharmacy Care
                </p>

                <p className="text-xs text-slate-500">Here when you need us</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
