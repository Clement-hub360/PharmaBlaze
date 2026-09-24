import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

type DbPrescriptionStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED";

type PrescriptionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
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
  message?: string;
  data: T;
};

type StatusFilter = "ALL" | DbPrescriptionStatus;

const STATUS_LABELS: Record<DbPrescriptionStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FULFILLED: "Completed",
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData instanceof Blob) {
      return "The server could not open the prescription document.";
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      return responseData.message;
    }

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const formatDate = (dateString: string) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCustomerName = (prescription: Prescription) => {
  return (
    prescription.user?.name ||
    prescription.user?.email ||
    prescription.user?.phone ||
    "Unknown Customer"
  );
};

const getCustomerContact = (prescription: Prescription) => {
  return (
    prescription.user?.email ||
    prescription.user?.phone ||
    "No contact information"
  );
};

const getFileName = (fileUrl: string) => {
  if (!fileUrl) {
    return "Prescription document";
  }

  const parts = fileUrl.split("/");
  const lastPart = parts[parts.length - 1];

  return lastPart || "Prescription document";
};

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
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusIcon = (status: DbPrescriptionStatus) => {
  switch (status) {
    case "PENDING":
      return <Clock3 className="h-4 w-4" />;

    case "REVIEWING":
      return <Eye className="h-4 w-4" />;

    case "APPROVED":
      return <CheckCircle2 className="h-4 w-4" />;

    case "REJECTED":
      return <XCircle className="h-4 w-4" />;

    case "FULFILLED":
      return <CheckCircle2 className="h-4 w-4" />;

    default:
      return <FileText className="h-4 w-4" />;
  }
};

function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  const loadPrescriptions = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await api.get<ApiResponse<Prescription[]>>("/prescriptions");

      setPrescriptions(response.data.data || []);
    } catch (requestError) {
      console.error("Load prescriptions error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const matchesStatus =
        statusFilter === "ALL" || prescription.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const customerName = getCustomerName(prescription).toLowerCase();
      const customerContact = getCustomerContact(prescription).toLowerCase();
      const notes = (prescription.notes || "").toLowerCase();
      const fileName = getFileName(prescription.fileUrl).toLowerCase();
      const prescriptionId = prescription.id.toLowerCase();

      return (
        customerName.includes(normalizedSearch) ||
        customerContact.includes(normalizedSearch) ||
        notes.includes(normalizedSearch) ||
        fileName.includes(normalizedSearch) ||
        prescriptionId.includes(normalizedSearch)
      );
    });
  }, [prescriptions, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: prescriptions.length,
      pending: prescriptions.filter(
        (prescription) => prescription.status === "PENDING",
      ).length,
      reviewing: prescriptions.filter(
        (prescription) => prescription.status === "REVIEWING",
      ).length,
      approved: prescriptions.filter(
        (prescription) => prescription.status === "APPROVED",
      ).length,
      rejected: prescriptions.filter(
        (prescription) => prescription.status === "REJECTED",
      ).length,
      fulfilled: prescriptions.filter(
        (prescription) => prescription.status === "FULFILLED",
      ).length,
    };
  }, [prescriptions]);

  const updatePrescriptionStatus = async (
    prescription: Prescription,
    status: DbPrescriptionStatus,
  ) => {
    try {
      setUpdatingStatusId(prescription.id);
      setError("");

      const response = await api.patch<ApiResponse<Prescription>>(
        `/prescriptions/${prescription.id}/status`,
        {
          status,
        },
      );

      const updatedPrescription = response.data.data;

      setPrescriptions((currentPrescriptions) =>
        currentPrescriptions.map((item) => {
          if (item.id !== prescription.id) {
            return item;
          }

          return {
            ...item,
            ...updatedPrescription,
            user: updatedPrescription.user || item.user,
          };
        }),
      );

      setSelectedPrescription((current) => {
        if (!current || current.id !== prescription.id) {
          return current;
        }

        return {
          ...current,
          ...updatedPrescription,
          user: updatedPrescription.user || current.user,
        };
      });
    } catch (requestError) {
      console.error("Update prescription status error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  /*
   * Opens a prescription through the authenticated backend endpoint.
   *
   * IMPORTANT:
   * Prescription files are stored in a PRIVATE Supabase bucket.
   *
   * The database fileUrl is now a private storage path such as:
   *
   * prescriptions/<userId>/<filename>.jpg
   *
   * Therefore we must NOT try to open fileUrl directly.
   *
   * Instead:
   * 1. Call GET /api/prescriptions/:id/file
   * 2. Axios attaches the admin JWT automatically.
   * 3. Backend verifies authorization.
   * 4. Backend downloads the private Supabase file.
   * 5. Browser receives the file as a Blob.
   * 6. We create a temporary browser URL and open it.
   */
  const openPrescriptionFile = async (prescription: Prescription) => {
    if (!prescription.fileUrl) {
      setError("No prescription document is attached to this record.");
      return;
    }

    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setError(
        "The document could not be opened because your browser blocked the popup. Please allow popups for this site and try again.",
      );
      return;
    }

    try {
      setOpeningFileId(prescription.id);
      setError("");

      previewWindow.document.title = "Loading Prescription Document...";
      previewWindow.document.body.textContent =
        "Loading prescription document...";

      const response = await api.get<Blob>(
        `/prescriptions/${prescription.id}/file`,
        {
          responseType: "blob",
        },
      );

      const headerContentType = response.headers["content-type"];

      const contentType =
        typeof headerContentType === "string" && headerContentType.trim()
          ? headerContentType
          : response.data.type || "application/octet-stream";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const blobUrl = URL.createObjectURL(blob);

      previewWindow.location.href = blobUrl;

      window.setTimeout(
        () => {
          URL.revokeObjectURL(blobUrl);
        },
        5 * 60 * 1000,
      );
    } catch (requestError) {
      console.error("Open prescription file error:", requestError);

      previewWindow.close();
      setError(getErrorMessage(requestError));
    } finally {
      setOpeningFileId(null);
    }
  };

  const exportPrescriptions = () => {
    if (filteredPrescriptions.length === 0) {
      setError("There are no prescriptions to export.");
      return;
    }

    const headers = [
      "Customer",
      "Email",
      "Phone",
      "Status",
      "Notes",
      "Document",
      "Submitted",
    ];

    const rows = filteredPrescriptions.map((prescription) => [
      getCustomerName(prescription),
      prescription.user?.email || "",
      prescription.user?.phone || "",
      STATUS_LABELS[prescription.status],
      prescription.notes || "",
      getFileName(prescription.fileUrl),
      formatDate(prescription.createdAt),
    ]);

    const escapeCsvValue = (value: string) => {
      const normalized = String(value ?? "").replace(/"/g, '""');
      return `"${normalized}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

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
    link.remove();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Prescriptions
              </h1>

              <p className="text-sm text-slate-500">
                Review and manage customer prescription submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadPrescriptions(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={exportPrescriptions}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">Something went wrong</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 transition hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">
            {counts.pending}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Under Review</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {counts.reviewing}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Approved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">
            {counts.approved}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-red-900">
            {counts.rejected}
          </p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-purple-700">Completed</p>
          <p className="mt-2 text-2xl font-bold text-purple-900">
            {counts.fulfilled}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, email, phone, notes, document or ID..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Filter className="h-4 w-4" />
              Status
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWING">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FULFILLED">Completed</option>
            </select>
          </div>

          {(search || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm">Loading prescriptions...</p>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FileText className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No prescriptions found
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            {search || statusFilter !== "ALL"
              ? "Try changing your search or filter."
              : "Customer prescription submissions will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Document
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPrescriptions.map((prescription) => (
                    <tr
                      key={prescription.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {getCustomerName(prescription)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {getCustomerContact(prescription)}
                          </p>

                          <p className="mt-1 max-w-[240px] truncate font-mono text-[11px] text-slate-400">
                            {prescription.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-medium text-slate-800">
                              {getFileName(prescription.fileUrl)}
                            </p>

                            {prescription.notes && (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                {prescription.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                            prescription.status,
                          )}`}
                        >
                          {getStatusIcon(prescription.status)}
                          {STATUS_LABELS[prescription.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(prescription.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void openPrescriptionFile(prescription)
                            }
                            disabled={openingFileId === prescription.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {openingFileId === prescription.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            {openingFileId === prescription.id
                              ? "Opening..."
                              : "Open"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPrescription(prescription)
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 lg:hidden">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {getCustomerName(prescription)}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {getCustomerContact(prescription)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                      prescription.status,
                    )}`}
                  >
                    {getStatusIcon(prescription.status)}
                    {STATUS_LABELS[prescription.status]}
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Document</p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {getFileName(prescription.fileUrl)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Submitted {formatDate(prescription.createdAt)}
                  </p>
                </div>

                {prescription.notes && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500">Notes</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void openPrescriptionFile(prescription)}
                    disabled={openingFileId === prescription.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {openingFileId === prescription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {openingFileId === prescription.id
                      ? "Opening..."
                      : "Open Document"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPrescription(prescription)}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail / Management Modal */}
      {selectedPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPrescription(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Prescription Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review the submission and update its status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrescription(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Customer */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="mt-2 text-base font-semibold text-slate-900">
                  {getCustomerName(selectedPrescription)}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {selectedPrescription.user?.email || "No email provided"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {selectedPrescription.user?.phone || "No phone provided"}
                </p>
              </div>

              {/* Document */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Prescription Document
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <FileText className="h-5 w-5" />
                      </div>

                      <p className="truncate text-sm font-medium text-slate-800">
                        {getFileName(selectedPrescription.fileUrl)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void openPrescriptionFile(selectedPrescription)
                    }
                    disabled={openingFileId === selectedPrescription.id}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {openingFileId === selectedPrescription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}

                    {openingFileId === selectedPrescription.id
                      ? "Opening..."
                      : "Open Document"}
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedPrescription.notes || "No notes were provided."}
                </p>
              </div>

              {/* Current Status */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current Status
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusClasses(
                      selectedPrescription.status,
                    )}`}
                  >
                    {getStatusIcon(selectedPrescription.status)}
                    {STATUS_LABELS[selectedPrescription.status]}
                  </span>
                </div>
              </div>

              {/* Status Controls */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Update Status
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      "PENDING",
                      "REVIEWING",
                      "APPROVED",
                      "REJECTED",
                      "FULFILLED",
                    ] as DbPrescriptionStatus[]
                  ).map((status) => {
                    const isCurrent = selectedPrescription.status === status;
                    const isUpdating =
                      updatingStatusId === selectedPrescription.id;

                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={isUpdating || isCurrent}
                        onClick={() =>
                          void updatePrescriptionStatus(
                            selectedPrescription,
                            status,
                          )
                        }
                        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          isCurrent
                            ? getStatusClasses(status)
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        <span className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          {STATUS_LABELS[status]}
                        </span>

                        {isCurrent && <CheckCircle2 className="h-4 w-4" />}

                        {isUpdating && !isCurrent && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedPrescription.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedPrescription.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedPrescription(null)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPrescriptions;
