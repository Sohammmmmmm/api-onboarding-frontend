import { Clock, AlertTriangle, CheckCircle, AlertOctagon } from "lucide-react";

export default function SlaBadge({
  status = "RUNNING",
  remainingText = "2h 15m remaining",
  breachText = "Breached by 45m",
  className = "",
}) {
  const normStatus = String(status).toUpperCase();

  if (normStatus === "COMPLETED") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <CheckCircle size={13} className="text-emerald-600 shrink-0" />
        <span>SLA: Completed</span>
      </span>
    );
  }

  if (normStatus === "DUE_SOON") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse ${className}`}>
        <AlertTriangle size={13} className="text-amber-600 shrink-0" />
        <span>SLA: Due Soon</span>
      </span>
    );
  }

  if (normStatus === "BREACHED") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
        <AlertOctagon size={13} className="text-rose-600 shrink-0" />
        <span>SLA: {breachText || "Breached"}</span>
      </span>
    );
  }

  // RUNNING default
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
      <Clock size={13} className="text-blue-600 shrink-0" />
      <span>SLA: {remainingText}</span>
    </span>
  );
}
