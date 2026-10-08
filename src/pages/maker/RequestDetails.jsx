import { ArrowLeft, CheckCircle2, MessageSquare, AlertCircle, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import Timeline from "../../components/common/Timeline";
import {
  getRequest,
  getRequestTimeline,
  sendClarification,
} from "../../services/onboardingService";
import { getApiErrorMessage } from "../../services/api";

export default function RequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clarification, setClarification] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timeline, setTimeline] = useState([]);

  const loadRequest = async () => {
    try {
      const [data, timelineData] = await Promise.all([
        getRequest(requestId),
        getRequestTimeline(requestId),
      ]);
      setRequest(data);
      setTimeline(
        Array.isArray(timelineData)
          ? timelineData
          : timelineData?.content ?? []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load request details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const handleClarification = async (e) => {
    e.preventDefault();
    if (!clarification.trim()) return;
    try {
      setSending(true);
      setError("");
      await sendClarification(requestId, { clarification: clarification.trim() });
      setClarification("");
      setSuccessMsg("Your clarification has been submitted to the Checker for review.");
      await loadRequest();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Unable to submit clarification. Please try again."));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader text="Loading Request Details..." />;
  if (error && !request) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 max-w-xl mx-auto text-center">
        <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
        <p className="font-bold">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/requests")}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  if (!request) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">Request not found.</div>;

  const isClarificationNeeded = request.status === "CLARIFICATION_REQUIRED";
  const isRejected = request.status === "REJECTED";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 font-sans pb-12">
      {/* Header and Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Request Details
              </h1>
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {request.requestId || request.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              API onboarding submission and status timeline &bull; Nishkaiv Solution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg("")} className="font-bold opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Alert Banner: CLARIFICATION REQUIRED (PDF Page 34 & 39) */}
      {isClarificationNeeded && (
        <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-orange-950">
                Action Required: Checker Requested Clarification
              </h3>
              <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                The Compliance Checker reviewed your request and requires additional information before deciding. Please provide details below.
              </p>

              <div className="mt-3 p-3.5 rounded-xl bg-white border border-orange-200 text-xs text-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  Checker Question
                </span>
                <p className="font-medium text-slate-900 leading-relaxed">
                  {request.clarificationQuestion || "Not available"}
                </p>
              </div>

              {/* Clarification Response Form */}
              <form onSubmit={handleClarification} className="mt-4 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  Your Clarification / Response:
                </label>
                <textarea
                  value={clarification}
                  onChange={(e) => setClarification(e.target.value)}
                  rows={3}
                  required
                  placeholder="Enter your response explaining the API requirement, TPS, security protocols, etc..."
                  className="w-full rounded-xl border border-orange-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-2xs resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>{sending ? "Submitting..." : "Submit Clarification"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Alert Banner: REJECTED (PDF Page 33 & 40) */}
      {isRejected && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-xs space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Request Rejected by Checker</h3>
              <p className="text-xs text-rose-700 mt-1">
                Reason: <strong>{request.rejectionReason || request.checkerRemarks || "Required business justification is missing."}</strong>
              </p>
              <p className="text-[11px] text-rose-600 mt-2">
                If you believe this was in error, you may submit a revised onboarding request with complete justifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Request Details Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{request.apiName || request.requestedApi}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provider: <strong className="text-slate-800">{request.provider}</strong> &bull; Consumer: <strong className="text-slate-800">{request.consumer}</strong>
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
            Environment: <strong className="text-blue-700">{request.environment || "Not available"}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Maker / Requester</span>
            <p className="font-semibold text-slate-800">{request.maker || "Not available"}</p>
            <p className="text-slate-500 text-[11px]">{request.makerEmail || "Not available"}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Source Input Method</span>
            <p className="font-semibold text-slate-800">{request.source === "EMAIL" ? "Email-Based (IMAP)" : "Maker Web Portal"}</p>
            <p className="text-slate-500 text-[11px]">Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleString() : "—"}</p>
          </div>

          <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business Justification</span>
            <p className="text-slate-700 leading-relaxed">{request.businessJustification || request.reason || "—"}</p>
          </div>

          {request.apiRequirement && (
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">API Requirement Specifications</span>
              <p className="text-slate-700 leading-relaxed font-mono text-[11px]">{request.apiRequirement}</p>
            </div>
          )}

          {request.additionalInformation && (
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Additional Information</span>
              <p className="text-slate-700 leading-relaxed">{request.additionalInformation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Clarification History Thread */}
      {request.clarificationThread && request.clarificationThread.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-600" />
            <span>Clarification Dialogue Thread</span>
          </h3>

          <div className="space-y-3 pt-2">
            {request.clarificationThread.map((msg, idx) => {
              const isChecker = msg.senderRole === "CHECKER";
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs ${
                    isChecker
                      ? "bg-purple-50/60 border-purple-200 text-purple-950"
                      : "bg-blue-50/60 border-blue-200 text-blue-950 ml-4 sm:ml-8"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{msg.sender || (isChecker ? "Checker (Compliance)" : "You (Maker)")}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Timeline events={timeline} title="Request Audit Trail & Timeline" />
    </div>
  );
}
