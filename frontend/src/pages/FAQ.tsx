import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Search,
  MessageCircle,
  MapPin,
  Phone,
  HelpCircle,
  ShieldCheck,
  ShoppingBag,
  Pill,
} from "lucide-react";

const faqCategories = [
  {
    title: "General Pharmacy Questions",
    icon: HelpCircle,
    questions: [
      {
        question: "Where is Pharmablaze Pharmacy located?",
        answer:
          "Pharmablaze Pharmacy is located at 235 Abak Rd, Uyo 520104, Akwa Ibom, Nigeria.",
      },
      {
        question: "How can I contact Pharmablaze Pharmacy?",
        answer:
          "You can contact Pharmablaze Pharmacy by phone at 0912 828 6533 or use the Contact page to send an enquiry.",
      },
      {
        question: "What products can I find at Pharmablaze Pharmacy?",
        answer:
          "Our product catalogue is designed to provide access to pharmacy products, wellness items, personal care products, vitamins, and other available health-related products. Product availability may vary.",
      },
    ],
  },
  {
    title: "Products & Shopping",
    icon: ShoppingBag,
    questions: [
      {
        question: "Can I check products online?",
        answer:
          "Yes. You can browse the Products section of this website to explore the available catalogue. Product information and availability will be updated as the online pharmacy system develops.",
      },
      {
        question: "Can I add products to my cart?",
        answer:
          "The website includes a shopping cart experience for products that are available for online ordering. Availability and ordering requirements may vary by product.",
      },
      {
        question: "What if a product is unavailable?",
        answer:
          "If a product is unavailable, you can contact Pharmablaze Pharmacy directly to ask about availability or possible alternatives.",
      },
    ],
  },
  {
    title: "Medication & Health",
    icon: Pill,
    questions: [
      {
        question: "Can I get help with medication information?",
        answer:
          "You can contact the pharmacy for medication-related enquiries. For personal medical decisions, diagnosis, or treatment, speak with a qualified healthcare professional.",
      },
      {
        question: "Can I purchase prescription medicines online?",
        answer:
          "Prescription medicine requirements can depend on the specific medicine and applicable regulations. Please contact the pharmacy directly for guidance before placing an order.",
      },
      {
        question: "Is the health information on this website medical advice?",
        answer:
          "No. Health resources on this website are intended for general educational purposes and should not replace advice from a qualified healthcare professional.",
      },
    ],
  },
  {
    title: "Orders & Support",
    icon: ShieldCheck,
    questions: [
      {
        question: "How do I get help with an order?",
        answer:
          "For assistance with an order or product enquiry, contact Pharmablaze Pharmacy using the available contact information. Please have your order details available when contacting the pharmacy.",
      },
      {
        question: "Can I ask about product availability before visiting?",
        answer:
          "Yes. Calling the pharmacy before visiting can help you confirm whether a particular product or item is currently available.",
      },
      {
        question: "How do I send a general enquiry?",
        answer:
          "Use the Contact page to submit your enquiry, or call Pharmablaze Pharmacy at 0912 828 6533.",
      },
    ],
  },
];

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleQuestion = (question: string) => {
    setOpenQuestion((current) => (current === question ? null : question));
  };

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="/images/faq-background.jpg"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-slate-950/75" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <HelpCircle size={16} />
              Frequently Asked Questions
            </span>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Answers to Your
              <span className="block text-emerald-400">Pharmacy Questions</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Find quick answers about Pharmablaze Pharmacy, products,
              medication enquiries, orders, and getting in touch with our
              pharmacy team.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="relative -mt-10 z-10 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="flex items-center gap-3 px-4">
              <Search className="shrink-0 text-slate-400" size={22} />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search frequently asked questions..."
                className="w-full border-0 bg-transparent py-4 text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {filteredCategories.length > 0 ? (
            <div className="space-y-14">
              {filteredCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <div key={category.title}>
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon size={24} />
                      </div>

                      <h2 className="text-2xl font-bold text-slate-900">
                        {category.title}
                      </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {category.questions.map((item, index) => {
                        const isOpen = openQuestion === item.question;

                        return (
                          <div
                            key={item.question}
                            className={
                              index !== category.questions.length - 1
                                ? "border-b border-slate-200"
                                : ""
                            }
                          >
                            <button
                              type="button"
                              onClick={() => toggleQuestion(item.question)}
                              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-slate-50"
                            >
                              <span className="font-semibold text-slate-900">
                                {item.question}
                              </span>

                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                                  isOpen
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <ChevronDown
                                  size={20}
                                  className={`transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </span>
                            </button>

                            {isOpen && (
                              <div className="px-6 pb-6 pr-16">
                                <p className="leading-7 text-slate-600">
                                  {item.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <Search size={40} className="mx-auto mb-4 text-slate-400" />

              <h2 className="text-2xl font-bold text-slate-900">
                No questions found
              </h2>

              <p className="mt-2 text-slate-600">
                Try searching with a different word or phrase.
              </p>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-950">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
                <MessageCircle size={16} />
                Still have questions?
              </span>

              <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">
                We're here to help.
              </h2>

              <p className="mt-5 leading-7 text-slate-300">
                If you cannot find the answer you're looking for, contact
                Pharmablaze Pharmacy directly and our team can help with your
                enquiry.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-400"
                >
                  Contact Us
                  <MessageCircle size={18} />
                </Link>

                <a
                  href="tel:09128286533"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
                >
                  <Phone size={18} />
                  0912 828 6533
                </a>
              </div>
            </div>

            {/* IMAGE SPACE */}
            <div className="relative min-h-[320px] bg-slate-800">
              <img
                src="/images/faq-support.jpg"
                alt="Pharmablaze Pharmacy support"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-slate-950/20" />
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <MapPin size={24} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Visit Pharmablaze Pharmacy
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                235 Abak Rd, Uyo 520104, Akwa Ibom, Nigeria
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Pharmablaze%20Pharmacy%2C%20235%20Abak%20Rd%2C%20Uyo%2C%20Akwa%20Ibom"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700"
              >
                Get Directions
                <MapPin size={18} />
              </a>
            </div>

            {/* LOCATION IMAGE SPACE */}
            <div className="overflow-hidden rounded-2xl bg-slate-200">
              <img
                src="/images/faq-location.jpg"
                alt="Pharmablaze Pharmacy location"
                className="h-72 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="bg-white px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </div>

            <p className="text-sm leading-6 text-slate-600">
              For urgent or personal medical concerns, seek advice from a
              qualified healthcare professional.
            </p>
          </div>

          <Link
            to="/health"
            className="shrink-0 font-bold text-emerald-600 hover:text-emerald-700"
          >
            Explore Health Resources →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
