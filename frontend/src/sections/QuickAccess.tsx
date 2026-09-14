import { Pill, HeartPulse, BookOpen, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function QuickAccess() {
  const cards = [
    {
      icon: Pill,
      title: "Browse Products",
      description: "Explore available pharmacy and healthcare products.",
      link: "/products",
      linkText: "View Products",
    },
    {
      icon: HeartPulse,
      title: "Pharmacy Services",
      description:
        "Learn more about the pharmacy services available at Pharmablaze.",
      link: "/services",
      linkText: "View Services",
    },
    {
      icon: BookOpen,
      title: "Health Resources",
      description: "Discover useful health and wellness information.",
      link: "/health",
      linkText: "Explore Resources",
    },
    {
      icon: MapPin,
      title: "Visit Pharmablaze",
      description: "Find our pharmacy at 235 Abak Rd, Uyo, Akwa Ibom.",
      link: "/contact",
      linkText: "Get Directions",
    },
  ];

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-700">
            Quick Access
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need, All in One Place
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Quickly find pharmacy products, services, health resources, and
            information about visiting Pharmablaze Pharmacy.
          </p>
        </div>

        {/* ACCESS CARDS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
              >
                {/* ICON */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">
                  <Icon size={26} />
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-bold text-slate-900">
                  {card.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                  {card.description}
                </p>

                {/* LINK */}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-green-700">
                  {card.linkText}

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default QuickAccess;
