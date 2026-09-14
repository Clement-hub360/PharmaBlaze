import { useEffect, useState } from "react";

import {
  ChevronDown,
  Menu,
  X,
  Search,
  User,
  ShoppingCart,
  Phone,
  MapPin,
  HeartPulse,
  Pill,
  Dumbbell,
  Apple,
  Stethoscope,
  BookOpen,
  HelpCircle,
  Star,
  MessageCircle,
  LogOut,
  UserRound,
} from "lucide-react";

import { Link, NavLink, useNavigate } from "react-router-dom";

type LoggedInUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
};

function Navbar() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [user, setUser] = useState<LoggedInUser | null>(null);

  // =====================================================
  // LOAD LOGGED-IN USER
  // =====================================================
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("pharmablaze_token");
      const storedUser = localStorage.getItem("pharmablaze_user");

      if (!token || !storedUser) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as LoggedInUser;
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("pharmablaze_user");
        setUser(null);
      }
    };

    loadUser();

    // Listen for authentication changes from other parts of the app.
    window.addEventListener("storage", loadUser);

    // Custom event for login/logout in the same browser tab.
    window.addEventListener("pharmablaze-auth-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("pharmablaze-auth-change", loadUser);
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem("pharmablaze_token");
    localStorage.removeItem("pharmablaze_user");

    setUser(null);
    setAccountOpen(false);
    closeMobile();

    window.dispatchEvent(new Event("pharmablaze-auth-change"));

    navigate("/", { replace: true });
  };

  // =====================================================
  // CLOSE MOBILE MENU / DROPDOWNS
  // =====================================================
  const closeMobile = () => {
    setMobileOpen(false);
    setAboutOpen(false);
    setServicesOpen(false);
    setShopOpen(false);
    setHealthOpen(false);
    setAccountOpen(false);
  };

  // =====================================================
  // NAV LINK STYLE
  // =====================================================
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-semibold transition ${
      isActive ? "text-emerald-600" : "text-slate-700 hover:text-emerald-600"
    }`;

  // =====================================================
  // CUSTOMER DISPLAY NAME
  // =====================================================
  const displayName = user?.name?.trim() || "My Account";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* =====================================================
          TOP UTILITY BAR
          ===================================================== */}
      <div className="hidden bg-slate-950 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-6">
            <a
              href="tel:09128286533"
              className="flex items-center gap-2 transition hover:text-emerald-400"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              0912 828 6533
            </a>

            <span className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              Uyo, Akwa Ibom
            </span>
          </div>

          <p className="font-medium text-slate-300">Pharmablaze Pharmacy</p>
        </div>
      </div>

      {/* =====================================================
          MAIN NAVIGATION
          ===================================================== */}
      <div className="border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* BRAND */}
            <Link to="/" onClick={closeMobile} className="flex items-center">
              <img
                src="/images/pharmablaze-logo-transparent.png"
                alt="Pharmablaze Pharmacy"
                className="h-14 w-14 object-contain"
              />

              <div className="ml-3 hidden sm:block">
                <p className="text-lg font-bold leading-tight text-slate-900">
                  Pharmablaze
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Pharmacy
                </p>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-7 lg:flex">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>

              {/* ABOUT */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAboutOpen(!aboutOpen);
                    setServicesOpen(false);
                    setShopOpen(false);
                    setHealthOpen(false);
                    setAccountOpen(false);
                  }}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-emerald-600"
                >
                  About
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      aboutOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {aboutOpen && (
                  <div className="absolute left-0 top-full mt-4 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    <Link
                      to="/about"
                      onClick={closeMobile}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      About Pharmablaze
                    </Link>

                    <Link
                      to="/reviews"
                      onClick={closeMobile}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      Customer Reviews
                    </Link>

                    <Link
                      to="/faq"
                      onClick={closeMobile}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      FAQ
                    </Link>
                  </div>
                )}
              </div>

              {/* SERVICES */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setServicesOpen(!servicesOpen);
                    setAboutOpen(false);
                    setShopOpen(false);
                    setHealthOpen(false);
                    setAccountOpen(false);
                  }}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-emerald-600"
                >
                  Services
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      servicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {servicesOpen && (
                  <div className="absolute left-0 top-full mt-4 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    <Link
                      to="/services"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <HeartPulse className="h-4 w-4 text-emerald-500" />
                      Pharmacy Services
                    </Link>

                    <Link
                      to="/services"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Stethoscope className="h-4 w-4 text-emerald-500" />
                      Pharmacy Support
                    </Link>

                    <Link
                      to="/contact"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-500" />
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>

              {/* SHOP */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShopOpen(!shopOpen);
                    setAboutOpen(false);
                    setServicesOpen(false);
                    setHealthOpen(false);
                    setAccountOpen(false);
                  }}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-emerald-600"
                >
                  Shop
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      shopOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {shopOpen && (
                  <div className="absolute left-0 top-full mt-4 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Pill className="h-4 w-4 text-emerald-500" />
                      All Products
                    </Link>

                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Apple className="h-4 w-4 text-emerald-500" />
                      Vitamins & Supplements
                    </Link>

                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Dumbbell className="h-4 w-4 text-emerald-500" />
                      Wellness
                    </Link>

                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Stethoscope className="h-4 w-4 text-emerald-500" />
                      Medical Devices
                    </Link>
                  </div>
                )}
              </div>

              {/* HEALTH */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setHealthOpen(!healthOpen);
                    setAboutOpen(false);
                    setServicesOpen(false);
                    setShopOpen(false);
                    setAccountOpen(false);
                  }}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-emerald-600"
                >
                  Health & Wellness
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      healthOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {healthOpen && (
                  <div className="absolute right-0 top-full mt-4 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    <Link
                      to="/health"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      Health Resources
                    </Link>

                    <Link
                      to="/health/articles"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      Health Articles
                    </Link>

                    <Link
                      to="/health/medication"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Pill className="h-4 w-4 text-emerald-500" />
                      Medication Information
                    </Link>

                    <Link
                      to="/health/wellness"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <HeartPulse className="h-4 w-4 text-emerald-500" />
                      Wellness Tips
                    </Link>

                    <Link
                      to="/faq"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <HelpCircle className="h-4 w-4 text-emerald-500" />
                      Health FAQ
                    </Link>
                  </div>
                )}
              </div>

              <NavLink to="/contact" className={navLinkClass}>
                Contact
              </NavLink>
            </nav>

            {/* =====================================================
                DESKTOP ACTIONS
                ===================================================== */}
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* ACCOUNT */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(!accountOpen);
                    setAboutOpen(false);
                    setServicesOpen(false);
                    setShopOpen(false);
                    setHealthOpen(false);
                  }}
                  aria-label="Account"
                  className="flex h-10 items-center gap-2 rounded-xl px-3 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <User className="h-5 w-5" />

                  {user ? (
                    <span className="max-w-24 truncate text-sm font-semibold">
                      {displayName.split(" ")[0]}
                    </span>
                  ) : (
                    <span className="hidden xl:inline text-sm font-semibold">
                      Login
                    </span>
                  )}

                  <ChevronDown
                    className={`hidden h-4 w-4 xl:block transition ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-4 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    {user ? (
                      <>
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">
                            {user.name || "Customer"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          to="/account"
                          onClick={closeMobile}
                          className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <UserRound className="h-4 w-4" />
                          My Account
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={closeMobile}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <User className="h-4 w-4" />
                          Login
                        </Link>

                        <Link
                          to="/register"
                          onClick={closeMobile}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <UserRound className="h-4 w-4" />
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* CART */}
              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
              >
                <ShoppingCart className="h-5 w-5" />

                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                  0
                </span>
              </Link>

              <Link
                to="/contact"
                className="ml-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                Get in Touch
                <MessageCircle className="h-4 w-4" />
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUB NAVIGATION
          ===================================================== */}
      <div className="hidden border-b border-slate-100 bg-slate-50 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-7 py-3">
            <Link
              to="/products"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-emerald-600"
            >
              Shop Categories
            </Link>

            <Link
              to="/products"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600"
            >
              Medicines
            </Link>

            <Link
              to="/products"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600"
            >
              Wellness
            </Link>

            <Link
              to="/products"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600"
            >
              Vitamins
            </Link>

            <Link
              to="/products"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600"
            >
              Personal Care
            </Link>

            <Link
              to="/products"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600"
            >
              Medical Devices
            </Link>
          </div>

          <Link
            to="/contact"
            className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Need Help?
          </Link>
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
          ===================================================== */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-4 py-5">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={closeMobile}
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                Home
              </Link>

              {/* MOBILE ABOUT */}
              <div>
                <button
                  type="button"
                  onClick={() => setAboutOpen(!aboutOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                >
                  About
                  <ChevronDown
                    className={`h-5 w-5 transition ${
                      aboutOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {aboutOpen && (
                  <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                    <Link
                      to="/about"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      About Pharmablaze
                    </Link>

                    <Link
                      to="/reviews"
                      onClick={closeMobile}
                      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      <Star className="h-4 w-4" />
                      Reviews
                    </Link>

                    <Link
                      to="/faq"
                      onClick={closeMobile}
                      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      <HelpCircle className="h-4 w-4" />
                      FAQ
                    </Link>
                  </div>
                )}
              </div>

              {/* MOBILE SERVICES */}
              <div>
                <button
                  type="button"
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                >
                  Services
                  <ChevronDown
                    className={`h-5 w-5 transition ${
                      servicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {servicesOpen && (
                  <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                    <Link
                      to="/services"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Pharmacy Services
                    </Link>

                    <Link
                      to="/contact"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Contact Pharmacy
                    </Link>
                  </div>
                )}
              </div>

              {/* MOBILE SHOP */}
              <div>
                <button
                  type="button"
                  onClick={() => setShopOpen(!shopOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                >
                  Shop
                  <ChevronDown
                    className={`h-5 w-5 transition ${
                      shopOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {shopOpen && (
                  <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      All Products
                    </Link>

                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Vitamins & Supplements
                    </Link>

                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Wellness
                    </Link>

                    <Link
                      to="/products"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Medical Devices
                    </Link>
                  </div>
                )}
              </div>

              {/* MOBILE HEALTH */}
              <div>
                <button
                  type="button"
                  onClick={() => setHealthOpen(!healthOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                >
                  Health & Wellness
                  <ChevronDown
                    className={`h-5 w-5 transition ${
                      healthOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {healthOpen && (
                  <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                    <Link
                      to="/health"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Health Resources
                    </Link>

                    <Link
                      to="/health/articles"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Health Articles
                    </Link>

                    <Link
                      to="/health/medication"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Medication Information
                    </Link>

                    <Link
                      to="/health/wellness"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50"
                    >
                      Wellness Tips
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                onClick={closeMobile}
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                Contact
              </Link>
            </div>

            {/* =====================================================
                MOBILE ACCOUNT AREA
                ===================================================== */}
            <div className="mt-5 border-t border-slate-100 pt-5">
              {user ? (
                <div className="mb-4 rounded-2xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user.name || "Customer"}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={user ? "/account" : "/login"}
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <User className="h-4 w-4" />
                  {user ? "My Account" : "Login"}
                </Link>

                <Link
                  to="/cart"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>

                {!user && (
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
                  >
                    <UserRound className="h-4 w-4" />
                    Create Account
                  </Link>
                )}

                {user && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}

                <Link
                  to="/contact"
                  onClick={closeMobile}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
