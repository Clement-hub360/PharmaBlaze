import { ArrowRight, BookOpen, HeartPulse, Pill, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

type Resource = {
  icon: typeof BookOpen;
  category: string;
  title: string;
  description: string;
  link: string;
};

const resources: Resource[] = [
  {
    icon: HeartPulse,
    category: "Healthy Living",
    title: "Everyday Health & Wellness",
    description:
      "Explore general information and practical resources that can support healthier everyday habits.",
    link: "/health/wellness",
  },
  {
    icon: Pill,
    category: "Medication",
    title: "Medication Information",
    description:
      "Learn about medications and important questions to discuss with a qualified healthcare professional.",
    link: "/health/medication",
  },
  {
    icon: Leaf,
    category: "Wellness",
    title: "Wellness Tips",
    description:
      "Discover educational wellness content covering everyday health and personal wellbeing.",
    link: "/health/wellness",
  },
];

function HealthResources() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-700">
              Health & Wellness
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Helpful Health Resources
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Explore educational resources designed to help you find useful
              information about health, wellness, and pharmacy topics.
            </p>
          </div>

          <Link
            to="/health"
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-green-700 transition hover:text-green-900"
          >
            View All Resources
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* RESOURCE CARDS */}
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;

            return (
              <article
                key={resource.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
              >
                {/* IMAGE SPACE */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg transition duration-300 group-hover:scale-105">
                      <Icon size={30} />
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
                    {resource.category}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2 text-green-700">
                    <BookOpen size={16} />

                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Health Resource
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 transition group-hover:text-green-700">
                    {resource.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {resource.description}
                  </p>

                  <Link
                    to={resource.link}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700"
                  >
                    Read More
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* EDUCATIONAL NOTICE */}
        <div className="mt-10 rounded-2xl border border-green-100 bg-green-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
              <BookOpen size={21} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Health information is for educational purposes
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Information published on this website should not replace
                professional medical advice, diagnosis, or treatment. Speak with
                a qualified healthcare professional about individual health
                concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HealthResources;
