import { ArrowLeft, CheckCircle2, Clock3, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import { getRequest, sendClarification } from "../../services/onboardingService";

export default function RequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clarification, setClarification] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequest = async () => {
      try { setRequest(await getRequest(requestId)); }
      catch (err) { console.error(err); setError("Unable to load request details."); }
      finally { setLoading(false); }
    };
    loadRequest();
  }, [requestId]);

  const handleClarification = async () => {
    if (!clarification.trim()) return;
    try {
      setSending(true);
      await sendClarification(requestId, { clarification });
      setClarification("");
      setRequest(await getRequest(requestId));
    } catch (err) {
      console.error(err);
      setError("Unable to send clarification.");
    } finally { setSending(false); }
  };

  if (loading) return <Loader />;
  if (error && !request) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:p-5">{error}</div>;
  if (!request) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">Request not found.</div>;

  const history = request.statusHistory || request.history || [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-blue-600 sm:h-10 sm:w-10"><ArrowLeft size={20} /></button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Request Details</h1>
          <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">{request.requestId}</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-slate-800 sm:text-xl">{request.apiName || "-"}</h2>
            <p className="mt-1 break-words text-sm text-slate-500">Provider: {request.provider || "-"}</p>
          </div>
          <div className="shrink-0"><StatusBadge status={request.status} /></div>
        </div>

        <div className="grid gap-5 py-5 sm:gap-6 sm:py-6 md:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase text-slate-400">Consumer</p><p className="mt-1 break-words text-sm text-slate-700">{request.consumer || "-"}</p></div>
          <div><p className="text-xs font-semibold uppercase text-slate-400">Environment</p><p className="mt-1 text-sm text-slate-700">{request.environment || "-"}</p></div>
          <div className="md:col-span-2"><p className="text-xs font-semibold uppercase text-slate-400">API Requirement</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{request.apiRequirement || "-"}</p></div>
          <div className="md:col-span-2"><p className="text-xs font-semibold uppercase text-slate-400">Business Justification</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{request.businessJustification || "-"}</p></div>
          {request.additionalInformation && <div className="md:col-span-2"><p className="text-xs font-semibold uppercase text-slate-400">Additional Information</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{request.additionalInformation}</p></div>}
        </div>
      </div>

      {history.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-800 sm:mb-6">Request Timeline</h2>
          <div className="space-y-5">
            {history.map((item, index) => (
              <div key={item.id || `${item.newStatus}-${index}`} className="flex gap-3 sm:gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">{item.newStatus === "APPROVED" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}</div>
                  {index < history.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
                </div>
                <div className="min-w-0 pb-5">
                  <StatusBadge status={item.newStatus} />
                  <p className="mt-2 break-words text-sm text-slate-600">{item.remarks || "Status updated"}</p>
                  {item.createdAt && <p className="mt-1 break-words text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {request.status === "CLARIFICATION_REQUIRED" && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 sm:p-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <MessageSquare className="mt-1 shrink-0 text-orange-600" size={20} />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-orange-800">Clarification Required</h2>
              <p className="mt-2 break-words text-sm text-orange-700">{request.clarificationQuestion || "Please provide the requested clarification."}</p>
              <textarea value={clarification} onChange={(event) => setClarification(event.target.value)} rows={4} placeholder="Enter your clarification..." className="mt-4 w-full resize-y rounded-lg border border-orange-200 bg-white px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:px-4 sm:text-sm" />
              <button type="button" onClick={handleClarification} disabled={sending} className="mt-3 w-full rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 sm:w-auto">{sending ? "Sending..." : "Submit Clarification"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
