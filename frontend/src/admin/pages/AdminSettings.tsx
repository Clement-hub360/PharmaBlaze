import { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock3,
  Truck,
  CreditCard,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Store,
  X,
  Share2,
} from "lucide-react";

type SettingsTab =
  | "pharmacy"
  | "store"
  | "delivery"
  | "payments"
  | "notifications"
  | "security";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("pharmacy");
  const [saved, setSaved] = useState(false);

  const [pharmacyName, setPharmacyName] = useState("Pharmablaze Pharmacy");
  const [phone, setPhone] = useState("0912 828 6533");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState(
    "2V56+V39, 235 Abak Rd, Uyo 520104, Akwa Ibom",
  );
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

  const [openingHours, setOpeningHours] = useState({
    monday: "8:00 AM - 8:00 PM",
    tuesday: "8:00 AM - 8:00 PM",
    wednesday: "8:00 AM - 8:00 PM",
    thursday: "8:00 AM - 8:00 PM",
    friday: "8:00 AM - 8:00 PM",
    saturday: "9:00 AM - 6:00 PM",
    sunday: "Closed",
  });

  const [storeEnabled, setStoreEnabled] = useState(true);
  const [allowOrders, setAllowOrders] = useState(true);
  const [requireConfirmation, setRequireConfirmation] = useState(true);

  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("1500");
  const [freeDeliveryMinimum, setFreeDeliveryMinimum] = useState("50000");

  const [paymentOnConfirmation, setPaymentOnConfirmation] = useState(true);
  const [onlinePayment, setOnlinePayment] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [reviewNotifications, setReviewNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");

  const tabs = [
    {
      id: "pharmacy" as SettingsTab,
      label: "Pharmacy",
      icon: Building2,
    },
    {
      id: "store" as SettingsTab,
      label: "Store",
      icon: Store,
    },
    {
      id: "delivery" as SettingsTab,
      label: "Delivery",
      icon: Truck,
    },
    {
      id: "payments" as SettingsTab,
      label: "Payments",
      icon: CreditCard,
    },
    {
      id: "notifications" as SettingsTab,
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "security" as SettingsTab,
      label: "Security",
      icon: ShieldCheck,
    },
  ];

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const updateHours = (day: keyof typeof openingHours, value: string) => {
    setOpeningHours((current) => ({
      ...current,
      [day]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage Pharmablaze Pharmacy information, store preferences,
                delivery options, notifications, and administrative settings.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Settings Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Settings Menu
              </p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <section className="space-y-6">
            {/* Pharmacy Settings */}
            {activeTab === "pharmacy" && (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Building2 className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Pharmacy Information
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Basic information displayed across the Pharmablaze
                        website.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Pharmacy Name
                      </label>

                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={pharmacyName}
                          onChange={(event) =>
                            setPharmacyName(event.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone Number
                      </label>

                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="pharmacy@example.com"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Website
                      </label>

                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                          placeholder="https://example.com"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Pharmacy Address
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                        <textarea
                          value={address}
                          onChange={(event) => setAddress(event.target.value)}
                          rows={3}
                          className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                      <Globe className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Social & Online Presence
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Add official social media links when they are confirmed.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Facebook
                      </label>

                      <div className="relative">
                        <Share2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={facebook}
                          onChange={(event) => setFacebook(event.target.value)}
                          placeholder="Facebook page URL"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Instagram
                      </label>

                      <div className="relative">
                        <Share2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={instagram}
                          onChange={(event) => setInstagram(event.target.value)}
                          placeholder="Instagram profile URL"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                      <Clock3 className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Opening Hours
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Configure the hours displayed to customers.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {(
                      Object.keys(openingHours) as Array<
                        keyof typeof openingHours
                      >
                    ).map((day) => (
                      <div
                        key={day}
                        className="grid items-center gap-3 sm:grid-cols-[140px_1fr]"
                      >
                        <label className="text-sm font-semibold capitalize text-slate-700">
                          {day}
                        </label>

                        <input
                          value={openingHours[day]}
                          onChange={(event) =>
                            updateHours(day, event.target.value)
                          }
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Store Settings */}
            {activeTab === "store" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Store className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Store Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Control the online shopping experience.
                    </p>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                  <ToggleRow
                    title="Online Store"
                    description="Allow customers to browse the online store."
                    enabled={storeEnabled}
                    onChange={setStoreEnabled}
                  />

                  <ToggleRow
                    title="Accept Orders"
                    description="Allow customers to submit orders through the website."
                    enabled={allowOrders}
                    onChange={setAllowOrders}
                  />

                  <ToggleRow
                    title="Order Confirmation"
                    description="Require pharmacy confirmation before an order is finalized."
                    enabled={requireConfirmation}
                    onChange={setRequireConfirmation}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-900">
                    Store status
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    These settings are currently frontend-only. They will be
                    connected to the backend when the API and database are
                    implemented.
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Settings */}
            {activeTab === "delivery" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Truck className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Delivery Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Configure delivery options for online orders.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <ToggleRow
                    title="Enable Delivery"
                    description="Allow customers to select delivery during checkout."
                    enabled={deliveryEnabled}
                    onChange={setDeliveryEnabled}
                  />
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Delivery Fee (₦)
                    </label>

                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(event) => setDeliveryFee(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Free Delivery Minimum (₦)
                    </label>

                    <input
                      type="number"
                      value={freeDeliveryMinimum}
                      onChange={(event) =>
                        setFreeDeliveryMinimum(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-amber-900">
                    Delivery information
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    Confirm actual delivery coverage, fees, and minimum order
                    requirements with the pharmacy before enabling these options
                    in production.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === "payments" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <CreditCard className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Payment Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Configure the payment methods available to customers.
                    </p>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                  <ToggleRow
                    title="Payment on Confirmation"
                    description="Allow customers to submit orders for payment confirmation by the pharmacy."
                    enabled={paymentOnConfirmation}
                    onChange={setPaymentOnConfirmation}
                  />

                  <ToggleRow
                    title="Online Payment"
                    description="Enable online payment after a verified payment provider has been configured."
                    enabled={onlinePayment}
                    onChange={setOnlinePayment}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
                  <p className="text-sm font-semibold text-red-900">
                    Payment security
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    Never store payment-card numbers, CVV codes, secret API
                    keys, or other payment credentials in this frontend page.
                    Production payment credentials belong in secure backend
                    environment variables and should be handled through a
                    compliant payment provider.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                    <Bell className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Notification Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose which events should notify administrators.
                    </p>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                  <ToggleRow
                    title="Email Notifications"
                    description="Enable administrative email notifications."
                    enabled={emailNotifications}
                    onChange={setEmailNotifications}
                  />

                  <ToggleRow
                    title="New Order Notifications"
                    description="Receive notifications when a new order is submitted."
                    enabled={orderNotifications}
                    onChange={setOrderNotifications}
                  />

                  <ToggleRow
                    title="New Review Notifications"
                    description="Receive notifications when customers submit reviews."
                    enabled={reviewNotifications}
                    onChange={setReviewNotifications}
                  />

                  <ToggleRow
                    title="New Message Notifications"
                    description="Receive notifications when customers submit contact messages."
                    enabled={messageNotifications}
                    onChange={setMessageNotifications}
                  />
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-red-50 p-3 text-red-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Admin Security
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Configure additional protection for administrator
                        accounts.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 divide-y divide-slate-100">
                    <ToggleRow
                      title="Two-Factor Authentication"
                      description="Require an additional verification step for administrator login."
                      enabled={twoFactorEnabled}
                      onChange={setTwoFactorEnabled}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Session Timeout
                    </label>

                    <select
                      value={sessionTimeout}
                      onChange={(event) =>
                        setSessionTimeout(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-sm"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="120">120 minutes</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>
                      <h3 className="font-bold text-red-900">
                        Production Security
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-red-700">
                        Authentication, password hashing, JWT handling,
                        role-based access control, rate limiting, secure
                        cookies/tokens, server-side validation, and audit
                        logging will be implemented in the backend. These
                        frontend controls are only interface settings at this
                        stage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end border-t border-slate-200 pt-6">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Saved Notification */}
      {saved && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl">
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">Settings saved</p>

              <p className="text-xs text-slate-500">
                Your changes have been applied to this session.
              </p>
            </div>

            <button
              onClick={() => setSaved(false)}
              className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ title, description, enabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default AdminSettings;
