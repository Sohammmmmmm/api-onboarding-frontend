import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Filter,
  RotateCcw,
  Search,
  Calendar,
  Eye,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import RequestSourceBadge from "../../components/common/RequestSourceBadge";
import { getCheckerRequests } from "../../services/checkerService";

const createDefaultFilters = (view) => ({
  provider: "ALL",
  consumer: "ALL",
  api: "ALL",
  maker: "ALL",
  status: "ALL",
  search: "",
  requestId: "",
});
const normalizeStatus = (status) => String(status || "").trim().toUpperCase().replace(/\s+/g, "_");
const isMakerReplied = (r) =>
  normalizeStatus(r.status) === "PENDING_REVIEW" && r.clarificationResponded === true;
const isClarificationItem = (r) =>
  normalizeStatus(r.status) === "CLARIFICATION_REQUIRED" || isMakerReplied(r);
const matchesRequestGroup = (request, group) => {
  const status = normalizeStatus(request.status);
  if (group === "new") return ["RECEIVED", "AI_ANALYZED"].includes(status);
  if (group === "pending") return ["PENDING_REVIEW", "UNDER_REVIEW"].includes(status) && !isMakerReplied(request);
  if (group === "clarification") return isClarificationItem(request);
  if (group === "approved") return ["APPROVED", "SUBSCRIBED"].includes(status);
  if (group === "rejected") return status === "REJECTED";
  return true;
};
const getDashboardSummary = (requests) => ({
  pendingReview: requests.filter((request) => matchesRequestGroup(request, "pending")).length,
  clarification: requests.filter((request) => matchesRequestGroup(request, "clarification")).length,
  approved: requests.filter((request) => matchesRequestGroup(request, "approved")).length,
  rejected: requests.filter((request) => matchesRequestGroup(request, "rejected")).length,
  totalRequests: requests.length,
});

export default function CheckerDashboard({ view = "dashboard" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedGroup = view === "filtered" ? (searchParams.get("group") || "").toLowerCase() : "";
  const selectedGroupTitle = {
    new: "New Requests",
    pending: "Pending Review Requests",
    clarification: "Clarification Requests",
    approved: "Approved Requests",
    rejected: "Rejected Requests",
  }[selectedGroup];

  const [dashboard, setDashboard] = useState({
    pendingReview: 0,
    clarification: 0,
    approved: 0,
    rejected: 0,
    totalRequests: 0,
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state per PDF Page 37
  const [filters, setFilters] = useState(() => createDefaultFilters(view));

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const loadData = async () => {
    setLoading(true);
    try {
      const reqsData = await getCheckerRequests();
      if (reqsData) {
        setRequests(reqsData);
        setDashboard(getDashboardSummary(reqsData));
      }
    } catch (e) {
      console.error("Failed to load checker dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFilters(createDefaultFilters(view));
    setCurrentPage(1);
  }, [view]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(createDefaultFilters(view));
    setCurrentPage(1);
  };

  const openRequestGroup = (group) => {
    navigate(`/checker/requests?group=${group}`);
  };

  // Filter options derived dynamically from data
  const providers = useMemo(() => {
    const set = new Set(requests.map((r) => r.provider).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [requests]);

  const consumers = useMemo(() => {
    const set = new Set(requests.map((r) => r.consumer).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [requests]);

  const makers = useMemo(() => {
    const set = new Set(requests.map((r) => r.maker).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [requests]);

  const statuses = [
    "ALL",
    "PENDING_REVIEW",
    "CLARIFICATION_REQUIRED",
    "UNDER_REVIEW",
    "APPROVED",
    "SUBSCRIBED",
    "REJECTED",
  ];

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const status = normalizeStatus(r.status);
      if (selectedGroup && !matchesRequestGroup(r, selectedGroup)) return false;
      if (view === "queue" && !["PENDING_REVIEW", "UNDER_REVIEW"].includes(status)) {
        return false;
      }
      if (view === "clarifications" && !isClarificationItem(r)) {
        return false;
      }
      if (filters.provider !== "ALL" && (r.provider || "").toLowerCase() !== filters.provider.toLowerCase()) {
        return false;
      }
      if (filters.consumer !== "ALL" && (r.consumer || "").toLowerCase() !== filters.consumer.toLowerCase()) {
        return false;
      }
      if (filters.maker !== "ALL" && (r.maker || "").toLowerCase() !== filters.maker.toLowerCase()) {
        return false;
      }
      if (filters.status !== "ALL" && status !== normalizeStatus(filters.status)) {
        return false;
      }
      if (filters.requestId && !(r.requestId || r.id || "").toLowerCase().includes(filters.requestId.toLowerCase())) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const str = `${r.requestId} ${r.apiName} ${r.provider} ${r.consumer} ${r.maker} ${r.reason}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [requests, filters, view, selectedGroup]);

  const repliedCount = useMemo(() => requests.filter(isMakerReplied).length, [requests]);
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / rowsPerPage));
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const lastUpdated = new Date().toLocaleString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {selectedGroupTitle || (view === "queue" ? "Review Queue" : view === "clarifications" ? "Clarifications" : view === "filtered" ? "Request Records" : "Checker Dashboard")}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedGroup
                ? `Showing all ${selectedGroup} requests with their decision details`
                : view === "queue"
                ? "Requests awaiting Checker review"
                : view === "clarifications"
                ? "Requests awaiting a Maker response"
                : "Review and process API onboarding requests • Nishkaiv Solution"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto shadow-2xs">
          <Calendar size={14} className="text-slate-400" />
          <span>Last Updated:</span>
          <span className="font-semibold text-slate-700">{lastUpdated}</span>
        </div>
      </div>

      {/* Summary Cards Row (PDF Page 37) */}
      {view === "dashboard" && <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Pending Review */}
        <button type="button" onClick={() => openRequestGroup("pending")} className="w-full text-left bg-white rounded-xl border border-amber-100 p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{dashboard.pendingReview}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Requires Checker action</p>
        </button>

        {/* Card 3: Clarification */}
        <button
          type="button"
          onClick={() => openRequestGroup("clarification")}
          className="w-full text-left bg-white rounded-xl border border-orange-200 p-4 shadow-xs transition hover:border-orange-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Clarification</span>
            <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <MessageSquare size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
  {(dashboard.clarification || 0) + repliedCount}
</p>

<p className="text-[10px] text-orange-600 font-medium mt-0.5">
  {repliedCount > 0
    ? `${repliedCount} Maker repl${repliedCount === 1 ? "y" : "ies"} received`
    : "Awaiting Maker reply"}
</p>
        </button>

        {/* Card 4: Approved */}
        <button type="button" onClick={() => openRequestGroup("approved")} className="w-full text-left bg-white rounded-xl border border-emerald-100 p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{dashboard.approved}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Subscribed / Live</p>
        </button>

        {/* Card 5: Rejected */}
        <button type="button" onClick={() => openRequestGroup("rejected")} className="w-full text-left bg-white rounded-xl border border-rose-100 p-4 shadow-xs col-span-2 sm:col-span-1 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rejected</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{dashboard.rejected}</p>
          <p className="text-[10px] text-rose-600 font-medium mt-0.5">Non-compliant requests</p>
        </button>
      </div>}

      {/* Filter Panel (PDF Page 37: Provider, Consumer, API, Maker, Status, Date, Request ID) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter size={15} className="text-purple-600" />
            <span>Request Filters</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Provider */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Provider
            </label>
            <select
              value={filters.provider}
              onChange={(e) => handleFilterChange("provider", e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-purple-500"
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p === "ALL" ? "All Providers" : p}
                </option>
              ))}
            </select>
          </div>

          {/* Consumer */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Consumer
            </label>
            <select
              value={filters.consumer}
              onChange={(e) => handleFilterChange("consumer", e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-purple-500"
            >
              {consumers.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Consumers" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Maker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Maker
            </label>
            <select
              value={filters.maker}
              onChange={(e) => handleFilterChange("maker", e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-purple-500"
            >
              {makers.map((m) => (
                <option key={m} value={m}>
                  {m === "ALL" ? "All Makers" : m}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-purple-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Request ID */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Request ID
            </label>
            <input
              type="text"
              placeholder="e.g. REQ-2025"
              value={filters.requestId}
              onChange={(e) => handleFilterChange("requestId", e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-purple-500"
            >
            </input>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search Text
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table (PDF Page 30 & 37) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {selectedGroupTitle || (view === "queue" ? "Review Queue" : view === "clarifications" ? "Clarification Requests" : "Onboarding Requests")} ({filteredRequests.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              {selectedGroup
                ? `Showing ${selectedGroupTitle?.toLowerCase() || "requests"} with status, date, and decision details`
                : view === "queue"
                ? "Requests ready for Checker action"
                : view === "clarifications"
                ? "Requests waiting for additional information from the Maker"
                : "Pending review queue and historical decisions"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/checker/catalogue")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 transition"
          >
            <span>Browse API Inventory</span>
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Maker</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Consumer</th>
                <th className="px-4 py-3">Requested API</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reason / Decision Details</th>
                <th className="px-4 py-3">Created On</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((req) => (
                  <tr
                    key={req.id || req.requestId}
                    className="hover:bg-purple-50/20 transition group"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <span className="text-purple-700">{req.requestId || req.id}</span>
                    </td>
                    <td className="px-4 py-3"><RequestSourceBadge source={req.source} /></td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-900">{req.maker || "User"}</p>
                        <p className="text-[10px] text-slate-400">{req.makerEmail || ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{req.provider || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{req.consumer || "—"}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-semibold text-slate-800 truncate" title={req.apiName || req.requestedApi}>
                        {req.apiName || req.requestedApi}
                      </p>
                      <span className="text-[10px] text-slate-400">{req.environment || "UAT"}</span>
                    </td>
                    <td className="px-4 py-3">
  <StatusBadge status={req.status} size="sm" />

  {isMakerReplied(req) && (
    <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
      Maker replied
    </span>
  )}
</td>
                    <td className="max-w-[240px] px-4 py-3 text-slate-600">
                      <span
                        className="block truncate"
                        title={req.rejectionReason || req.reason || req.checkerRemarks || req.clarificationQuestion || req.businessJustification || "—"}
                      >
                        {req.rejectionReason || req.reason || req.checkerRemarks || req.clarificationQuestion || req.businessJustification || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {req.createdAt || req.submittedOn || req.createdDate
                        ? new Date(req.createdAt || req.submittedOn || req.createdDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/checker/requests/${req.requestId || req.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-2xs transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold text-slate-700">No requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the filters above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedRequests.map((req) => (
            <div key={req.id || req.requestId} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-700">{req.requestId || req.id}</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{req.apiName || req.requestedApi}</p>
                </div>
                <div className="flex flex-col items-end">
  <RequestSourceBadge source={req.source} />
  <StatusBadge status={req.status} size="sm" />

  {isMakerReplied(req) && (
    <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
      Maker replied
    </span>
  )}
</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Maker</span>
                  <span className="font-semibold text-slate-800">{req.maker || "User"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Provider</span>
                  <span>{req.provider}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Consumer</span>
                  <span>{req.consumer}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Environment</span>
                  <span>{req.environment || "UAT"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Created On</span>
                  <span>{req.createdAt || req.submittedOn || req.createdDate
                    ? new Date(req.createdAt || req.submittedOn || req.createdDate).toLocaleDateString()
                    : "—"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Reason / Decision Details</span>
                  <span>{req.rejectionReason || req.reason || req.checkerRemarks || req.clarificationQuestion || req.businessJustification || "—"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/checker/requests/${req.requestId || req.id}`)}
                className="w-full h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Eye size={14} />
                <span>Review Request</span>
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, filteredRequests.length)} of {filteredRequests.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-slate-800">{currentPage} / {totalPages}</span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
