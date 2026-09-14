import {
  MapPin,
  HeartHandshake,
  PackageCheck,
  Store,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function WhyChooseUs() {
  const benefits = [
    {
      icon: Store,
      title: "Local Pharmacy",
      description:
        "Visit Pharmablaze Pharmacy at our location on 235 Abak Rd in Uyo, Akwa Ibom.",
    },
    {
      icon: HeartHandshake,
      title: "Customer-Focused Service",
      description:
        "We aim to provide a convenient and welcoming pharmacy experience for our customers.",
    },
    {
      icon: PackageCheck,
      title: "Pharmacy Products",
      description:
        "Explore our growing selection of pharmacy, wellness, personal care, and healthcare products.",
    },
    {
      icon: MapPin,
      title: "Convenient Location",
      description:
        "Our pharmacy is conveniently located on Abak Road, Uyo, Akwa Ibom.",
    },
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* HEADER */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-700">
            Why Pharmablaze
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A Pharmacy You Can Easily Connect With
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Pharmablaze Pharmacy is focused on making access to pharmacy
            products and customer support simple and convenient.
          </p>
        </div>

        {/* BENEFIT CARDS */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
              >
                {/* ICON */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-700 transition duration-300 group-hover:bg-green-700 group-hover:text-white">
                  <Icon size={27} />
                </div>

                {/* TITLE */}
                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {benefit.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* LOCATION / CTA */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-green-700">
          <div className="grid items-center gap-8 px-8 py-10 lg:grid-cols-[1fr_auto] lg:px-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-100">
                Visit Pharmablaze
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                We're located on Abak Road, Uyo
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">
                235 Abak Rd, Uyo, Akwa Ibom, Nigeria
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-green-700 transition hover:bg-green-50"
            >
              Contact Us
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
