import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MessageSquare,
  Mail,
  MailOpen,
  Eye,
  Trash2,
  X,
  Clock3,
  User,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Phone,
} from "lucide-react";

import api from "../../services/api";

type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: MessageStatus;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type StatusFilter = "All" | MessageStatus;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: MessageStatus) {
  switch (status) {
    case "NEW":
      return "Unread";
    case "READ":
      return "Read";
    case "REPLIED":
      return "Replied";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/contact");

      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid messages response from server.");
      }

      setMessages(data as Message[]);
    } catch (err) {
      console.error("Load messages error:", err);

      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        message.name.toLowerCase().includes(searchText) ||
        message.email.toLowerCase().includes(searchText) ||
        (message.phone ?? "").toLowerCase().includes(searchText) ||
        (message.subject ?? "").toLowerCase().includes(searchText) ||
        message.message.toLowerCase().includes(searchText) ||
        message.id.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || message.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const stats = useMemo(() => {
    const total = messages.length;

    const unread = messages.filter(
      (message) => message.status === "NEW",
    ).length;

    const read = messages.filter((message) => message.status === "READ").length;

    const replied = messages.filter(
      (message) => message.status === "REPLIED",
    ).length;

    return {
      total,
      unread,
      read,
      replied,
    };
  }, [messages]);

  const openMessage = async (message: Message) => {
    setSelectedMessage(message);

    if (message.status === "NEW") {
      try {
        const response = await api.patch(`/contact/${message.id}/status`, {
          status: "READ",
        });

        const updatedMessage = response.data?.data as Message;

        setMessages((current) =>
          current.map((item) =>
            item.id === message.id ? updatedMessage : item,
          ),
        );

        setSelectedMessage(updatedMessage);
      } catch (err) {
        console.error("Mark message as read error:", err);
      }
    }
  };

  const updateStatus = async (id: string, status: MessageStatus) => {
    try {
      const response = await api.patch(`/contact/${id}/status`, { status });

      const updatedMessage = response.data?.data as Message;

      setMessages((current) =>
        current.map((message) =>
          message.id === id ? updatedMessage : message,
        ),
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage(updatedMessage);
      }
    } catch (err) {
      console.error("Update message status error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to update message status.",
      );
    }
  };

  const deleteMessage = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/contact/${id}`);

      setMessages((current) => current.filter((message) => message.id !== id));

      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Delete message error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to delete message.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                <MessageSquare className="h-4 w-4" />
                Customer Communication
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Messages
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage customer enquiries, contact requests, and other messages
                submitted through the pharmacy website.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadMessages(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Inbox Status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {stats.unread}
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Unread
                    </p>

                    <p className="text-xs text-slate-500">
                      messages requiring attention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div>
              <p className="font-bold">Unable to complete the request</p>
              <p className="mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Messages
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Unread</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.unread}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Mail className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Read</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.read}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <MailOpen className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Replied</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.replied}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages, customers, subjects or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Messages</option>
              <option value="NEW">Unread</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Message Inbox</h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredMessages.length} message
              {filteredMessages.length !== 1 ? "s" : ""} shown
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading messages...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">Customer</th>

                      <th className="px-5 py-4">Subject</th>

                      <th className="px-5 py-4">Message</th>

                      <th className="px-5 py-4">Status</th>

                      <th className="px-5 py-4">Received</th>

                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredMessages.map((message) => (
                      <tr
                        key={message.id}
                        className={`transition hover:bg-slate-50 ${
                          message.status === "NEW" ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                              <User className="h-5 w-5" />
                            </div>

                            <div>
                              <p
                                className={`text-sm ${
                                  message.status === "NEW"
                                    ? "font-bold text-slate-900"
                                    : "font-semibold text-slate-800"
                                }`}
                              >
                                {message.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {message.email}
                              </p>

                              {message.phone && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {message.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {message.subject || "General Enquiry"}
                          </p>
                        </td>

                        <td className="max-w-[320px] px-5 py-4">
                          <p className="truncate text-sm text-slate-500">
                            {message.message}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {message.status === "NEW" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                              Unread
                            </span>
                          ) : message.status === "READ" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Read
                            </span>
                          ) : message.status === "REPLIED" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Replied
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              Archived
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600">
                            {formatDate(message.createdAt)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(message.createdAt)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void openMessage(message)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="View message"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(
                                  message.id,
                                  message.status === "NEW" ? "READ" : "NEW",
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              title={
                                message.status === "NEW"
                                  ? "Mark as read"
                                  : "Mark as unread"
                              }
                            >
                              {message.status === "NEW" ? (
                                <MailOpen className="h-4 w-4" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => void deleteMessage(message.id)}
                              className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                              title="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-5 ${
                      message.status === "NEW" ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <User className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {message.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {message.email}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {getStatusLabel(message.status)}
                      </span>
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      {message.subject || "General Enquiry"}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {message.message}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(message.createdAt)}
                        <Clock3 className="ml-1 h-3.5 w-3.5" />
                        {formatTime(message.createdAt)}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openMessage(message)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void updateStatus(
                              message.id,
                              message.status === "NEW" ? "READ" : "NEW",
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600"
                        >
                          {message.status === "NEW" ? (
                            <MailOpen className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteMessage(message.id)}
                          className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMessages.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No messages found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {messages.length === 0
                      ? "Messages submitted through the contact form will appear here."
                      : "Try changing your search or filter."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Message Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedMessage.subject || "General Enquiry"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedMessage.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {selectedMessage.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMessage.email}
                  </p>

                  {selectedMessage.phone && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedMessage.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    Date
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    Time
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatTime(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer Message
                </p>

                <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Message Status
                </p>

                <div className="flex flex-wrap gap-2">
                  {(
                    ["NEW", "READ", "REPLIED", "ARCHIVED"] as MessageStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        void updateStatus(selectedMessage.id, status)
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        selectedMessage.status === status
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-5">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedMessage.status === "NEW"
                      ? "bg-blue-50 text-blue-700"
                      : selectedMessage.status === "REPLIED"
                        ? "bg-purple-50 text-purple-700"
                        : selectedMessage.status === "ARCHIVED"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {getStatusLabel(selectedMessage.status)}
                </span>

                <button
                  type="button"
                  onClick={() => void deleteMessage(selectedMessage.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
