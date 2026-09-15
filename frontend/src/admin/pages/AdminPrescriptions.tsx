import { useEffect, useMemo, useState } from "react";

import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Filter,
  User,
  CalendarDays,
  Phone,
  X,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import api from "../../services/api";

type DbPrescriptionStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED";

type PrescriptionStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Completed";

type PrescriptionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type Prescription = {
  id: string;
  userId: string;
  fileUrl: string;
  notes?: string | null;
  status: DbPrescriptionStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: PrescriptionUser;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const statusLabels: Record<DbPrescriptionStatus, PrescriptionStatus> = {
  PENDING: "Pending",
  REVIEWING: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FULFILLED: "Completed",
};

const statusValues: Array<{
  value: DbPrescriptionStatus;
  label: PrescriptionStatus;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FULFILLED", label: "Completed" },
];

function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

      return response?.data?.message || "Something went wrong.";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong.";
  };

  const loadPrescriptions = async (showRefreshing = false) => {
    try {
      setError("");

      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await api.get<ApiResponse<Prescription[]>>("/prescriptions");

      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error("Load prescriptions error:", error);

      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPrescriptions();
  }, []);

  const updateStatus = async (
    prescription: Prescription,
    status: DbPrescriptionStatus,
  ) => {
    try {
      setUpdatingId(prescription.id);
      setError("");

      const response = await api.patch<ApiResponse<Prescription>>(
        `/prescriptions/${prescription.id}/status`,
        { status },
      );

      const updatedPrescription = response.data.data;

      setPrescriptions((current) =>
        current.map((item) =>
          item.id === updatedPrescription.id ? updatedPrescription : item,
        ),
      );

      setSelectedPrescription(updatedPrescription);
    } catch (error) {
      console.error("Update prescription status error:", error);

      setError(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const customerName = prescription.user?.name?.toLowerCase() || "";

      const customerEmail = prescription.user?.email?.toLowerCase() || "";

      const customerPhone = prescription.user?.phone?.toLowerCase() || "";

      const prescriptionId = prescription.id.toLowerCase();

      const notes = prescription.notes?.toLowerCase() || "";

      const matchesSearch =
        query === "" ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerPhone.includes(query) ||
        prescriptionId.includes(query) ||
        notes.includes(query);

      const matchesStatus =
        statusFilter === "All" || prescription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const pendingCount = prescriptions.filter(
    (item) => item.status === "PENDING",
  ).length;

  const reviewCount = prescriptions.filter(
    (item) => item.status === "REVIEWING",
  ).length;

  const approvedCount = prescriptions.filter(
    (item) => item.status === "APPROVED",
  ).length;

  const completedCount = prescriptions.filter(
    (item) => item.status === "FULFILLED",
  ).length;

  const getStatusClasses = (status: DbPrescriptionStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "REVIEWING":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "FULFILLED":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: DbPrescriptionStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock size={14} />;

      case "REVIEWING":
        return <Eye size={14} />;

      case "APPROVED":
        return <CheckCircle2 size={14} />;

      case "REJECTED":
        return <XCircle size={14} />;

      case "FULFILLED":
        return <CheckCircle2 size={14} />;

      default:
        return <FileText size={14} />;
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const exportPrescriptions = () => {
    if (filteredPrescriptions.length === 0) {
      return;
    }

    const headers = [
      "Prescription ID",
      "Customer",
      "Email",
      "Phone",
      "Status",
      "Submitted",
      "Reviewed At",
      "Notes",
      "File URL",
    ];

    const rows = filteredPrescriptions.map((prescription) => [
      prescription.id,
      prescription.user?.name || "",
      prescription.user?.email || "",
      prescription.user?.phone || "",
      statusLabels[prescription.status],
      formatDate(prescription.createdAt),
      prescription.reviewedAt ? formatDate(prescription.reviewedAt) : "",
      prescription.notes || "",
      prescription.fileUrl || "",
    ]);

    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const csv = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `pharmablaze-prescriptions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * Convert a backend-relative file URL
   * into a complete backend URL.
   *
   * Example:
   *
   * /uploads/prescriptions/file.jpg
   *
   * becomes:
   *
   * http://localhost:5000/uploads/prescriptions/file.jpg
   *
   * This is necessary because the Admin
   * frontend runs on port 5173 while uploaded
   * prescription files are served by the
   * backend on port 5000.
   */
  const getPrescriptionFileUrl = (fileUrl: string) => {
    if (!fileUrl) {
      return "";
    }

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    const backendBaseUrl = "http://localhost:5000";

    if (fileUrl.startsWith("/")) {
      return `${backendBaseUrl}${fileUrl}`;
    }

    return `${backendBaseUrl}/${fileUrl}`;
  };

  const openPrescriptionFile = (fileUrl: string) => {
    const fullFileUrl = getPrescriptionFileUrl(fileUrl);

    if (!fullFileUrl) {
      return;
    }

    window.open(fullFileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Admin</span>
                <span>/</span>
                <span>Prescriptions</span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Prescription Management
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Review and manage prescription submissions securely. Final
                approval should always be handled by an appropriately authorized
                pharmacy professional.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <ShieldCheck className="text-emerald-600" size={22} />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Secure Workflow
                </p>

                <p className="text-sm text-emerald-800">
                  Prescription information
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <section className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                Unable to complete the request
              </p>

              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => void loadPrescriptions(true)}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Retry
            </button>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3">
                <Clock className="text-amber-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Action needed
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {pendingCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">Pending prescriptions</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3">
                <Eye className="text-blue-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                In progress
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {reviewCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">Under review</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="text-emerald-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Approved
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {approvedCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">Ready for processing</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3">
                <FileText className="text-purple-600" size={22} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Finished
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {completedCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Completed prescriptions
            </p>
          </div>
        </section>

        <section className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <AlertCircle className="mt-0.5 shrink-0 text-blue-600" size={20} />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Prescription handling notice
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Prescription records are now loaded from the database.
              Prescription files and health-related information should only be
              stored and processed with appropriate security, access controls,
              retention policies, and applicable regulatory requirements.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by customer, ID, email, phone or notes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-52"
                >
                  <option value="All">All Statuses</option>

                  {statusValues.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => void loadPrescriptions(true)}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={exportPrescriptions}
                disabled={filteredPrescriptions.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={17} />
                Export
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Prescription Submissions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredPrescriptions.length} record
                  {filteredPrescriptions.length === 1 ? "" : "s"} displayed
                </p>
              </div>

              <FileText className="text-slate-300" size={24} />
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <RefreshCw
                className="mx-auto animate-spin text-emerald-600"
                size={32}
              />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading prescriptions...
              </p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto text-slate-300" size={42} />

              <h3 className="mt-4 font-semibold text-slate-900">
                No prescriptions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {prescriptions.length === 0
                  ? "There are currently no prescription records in the database."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Prescription</th>

                    <th className="px-5 py-4">Customer</th>

                    <th className="px-5 py-4">Submitted</th>

                    <th className="px-5 py-4">Notes</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPrescriptions.map((prescription) => (
                    <tr
                      key={prescription.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate font-semibold text-slate-900">
                          {prescription.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {prescription.fileUrl
                            ? "Document attached"
                            : "No document URL"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {prescription.user?.name || "Unknown customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {prescription.user?.phone ||
                            prescription.user?.email ||
                            "No contact information"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(prescription.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[220px] truncate text-sm text-slate-600">
                          {prescription.notes || "No notes"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                            prescription.status,
                          )}`}
                        >
                          {getStatusIcon(prescription.status)}

                          {statusLabels[prescription.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPrescription(prescription)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 space-y-4 lg:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <RefreshCw
                className="mx-auto animate-spin text-emerald-600"
                size={32}
              />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading prescriptions...
              </p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <FileText className="mx-auto text-slate-300" size={42} />

              <h3 className="mt-4 font-semibold text-slate-900">
                No prescriptions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <article
                key={prescription.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="max-w-[210px] truncate font-bold text-slate-900">
                      {prescription.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(prescription.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      prescription.status,
                    )}`}
                  >
                    {getStatusIcon(prescription.status)}

                    {statusLabels[prescription.status]}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="text-slate-400" size={17} />

                    <div>
                      <p className="text-xs text-slate-400">Customer</p>

                      <p className="text-sm font-medium text-slate-800">
                        {prescription.user?.name || "Unknown customer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-slate-400" size={17} />

                    <div>
                      <p className="text-xs text-slate-400">Phone</p>

                      <p className="text-sm text-slate-700">
                        {prescription.user?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarDays className="text-slate-400" size={17} />

                    <div>
                      <p className="text-xs text-slate-400">Submitted</p>

                      <p className="text-sm text-slate-700">
                        {formatDate(prescription.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPrescription(prescription)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Eye size={17} />
                  View Prescription
                </button>
              </article>
            ))
          )}
        </section>
      </main>

      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Prescription Record
                </p>

                <h2 className="mt-1 max-w-[300px] truncate text-xl font-bold text-slate-900">
                  {selectedPrescription.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrescription(null)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <FileText className="text-emerald-600" size={26} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        Prescription Document
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedPrescription.fileUrl
                          ? "A document URL is attached to this record."
                          : "No document URL is available."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedPrescription.fileUrl}
                    onClick={() =>
                      openPrescriptionFile(selectedPrescription.fileUrl)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ExternalLink size={17} />
                    Open Document
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedPrescription.user?.name || "Unknown customer"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedPrescription.user?.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-2 break-all font-semibold text-slate-900">
                    {selectedPrescription.user?.email || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Submitted
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {formatDate(selectedPrescription.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Status
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                      selectedPrescription.status,
                    )}`}
                  >
                    {getStatusIcon(selectedPrescription.status)}

                    {statusLabels[selectedPrescription.status]}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Last Reviewed
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedPrescription.reviewedAt
                      ? formatDate(selectedPrescription.reviewedAt)
                      : "Not reviewed"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedPrescription.notes ||
                    "No notes were provided with this prescription."}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Update Prescription Status
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {statusValues.map((status) => {
                    const isCurrent =
                      selectedPrescription.status === status.value;

                    const isUpdating = updatingId === selectedPrescription.id;

                    return (
                      <button
                        key={status.value}
                        type="button"
                        disabled={isCurrent || isUpdating}
                        onClick={() =>
                          void updateStatus(selectedPrescription, status.value)
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${
                          isCurrent
                            ? getStatusClasses(status.value)
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {getStatusIcon(status.value)}

                        {isUpdating && !isCurrent
                          ? "Updating..."
                          : status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                <button
                  type="button"
                  disabled={!selectedPrescription.fileUrl}
                  onClick={() =>
                    openPrescriptionFile(selectedPrescription.fileUrl)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download size={17} />
                  Open / Download
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPrescription(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <X size={17} />
                  Close
                </button>
              </div>

              <p className="text-center text-xs leading-5 text-slate-400">
                Prescription status changes are saved directly to the database.
                Only authorized pharmacy personnel should make clinical approval
                decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPrescriptions;
