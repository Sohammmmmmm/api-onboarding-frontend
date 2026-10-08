import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send, Undo2, AlertTriangle, ShieldCheck, Trash2, Clock } from "lucide-react";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import Timeline from "../../components/common/Timeline";
import {
  getPublisherApiDetails,
  getPublisherApiTimeline,
  publishApi,
  returnApi,
  deprecateApi,
  retireApi,
} from "../../services/publisherService";

export default function PublisherApiDetails() {
  const { apiId } = useParams();
  const navigate = useNavigate();

  const [apiDetails, setApiDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    try {
      const [data, timeData] = await Promise.all([
        getPublisherApiDetails(apiId),
        getPublisherApiTimeline(apiId),
      ]);
      setApiDetails(data);
      setTimeline(Array.isArray(timeData) ? timeData : timeData?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiId]);

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await publishApi(apiId, { remarks });
      setFeedback({ type: "success", message: "API Published successfully to active Catalogue." });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!remarks.trim()) {
      alert("Please enter a reason for sending back.");
      return;
    }
    setActionLoading(true);
    try {
      await returnApi(apiId, { reason: remarks });
      setFeedback({ type: "warning", message: "API returned to Checker for review." });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeprecate = async () => {
    setActionLoading(true);
    try {
      await deprecateApi(apiId, { reason: remarks });
      setFeedback({ type: "warning", message: "API status updated to DEPRECATED." });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetire = async () => {
    setActionLoading(true);
    try {
      await retireApi(apiId, { reason: remarks });
      setFeedback({ type: "danger", message: "API status updated to RETIRED." });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading API details..." />;
  if (!apiDetails) return <div className="p-8 text-center">API not found.</div>;

  const currentStatus = String(apiDetails.status).toUpperCase();
  const isPending = currentStatus === "PENDING_PUBLICATION";
  const isPublished = currentStatus === "PUBLISHED";
  const isDeprecated = currentStatus === "DEPRECATED";
  const isRetired = currentStatus === "RETIRED";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{apiDetails.apiName}</h1>
              <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {apiDetails.version || "v1.0"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Provider: <strong className="text-slate-800">{apiDetails.provider}</strong> &bull; Category: <strong className="text-slate-800">{apiDetails.category}</strong>
            </p>
          </div>
        </div>

        <StatusBadge status={apiDetails.status} />
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : feedback.type === "danger"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Main API Info Grid */}
      <div className="glass rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">API Specification Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Base URL</span>
            <span className="font-mono font-bold text-slate-800 break-all">{apiDetails.baseUrl || "https://api.nishkaiv.com/gateway/v1"}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Authentication Type</span>
            <span className="font-semibold text-slate-800">{apiDetails.authType || "OAuth2"}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Environment</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
              {apiDetails.environment || "UAT"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Created By</span>
            <span className="font-semibold text-slate-800">{apiDetails.createdBy || "Checker Officer"}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Checker Approval</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>Approved</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Checker Approval Time</span>
            <span className="text-slate-600">
              {apiDetails.checkerApprovalTime ? new Date(apiDetails.checkerApprovalTime).toLocaleString() : "Today"}
            </span>
          </div>

          <div className="col-span-full p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</span>
            <p className="text-slate-700 leading-relaxed">{apiDetails.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="glass rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Publisher Actions</h2>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Publisher Remarks / Notes</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter reason or publication remarks..."
            rows={2}
            className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isPending && (
            <>
              <button
                type="button"
                onClick={handlePublish}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>{actionLoading ? "Publishing..." : "Publish API"}</span>
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Undo2 size={16} />
                <span>Send Back to Checker</span>
              </button>
            </>
          )}

          {isPublished && (
            <button
              type="button"
              onClick={handleDeprecate}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle size={16} />
              <span>Deprecate API</span>
            </button>
          )}

          {isDeprecated && (
            <button
              type="button"
              onClick={handleRetire}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={16} />
              <span>Retire API</span>
            </button>
          )}

          {isRetired && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
              This API is Retired (No actions available).
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Timeline events={timeline} title="API Governance Lifecycle Timeline" />
    </div>
  );
}
