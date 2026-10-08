const STATUS_CONFIG = {
  RECEIVED: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    label: "Received",
  },
  PROCESSING: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Processing",
  },
  AI_ANALYZED: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    label: "AI Analyzed",
  },
  PENDING: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Pending",
  },
  PENDING_REVIEW: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "Pending Review",
  },
  UNDER_REVIEW: {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    label: "Under Review",
  },
  CLARIFICATION_REQUIRED: {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500 animate-pulse",
    label: "Clarification Required",
  },
  APPROVED: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Approved",
  },
  SUBSCRIBED: {
    bg: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
    label: "Subscribed",
  },
  REJECTED: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    label: "Rejected",
  },
};

export default function StatusBadge({ status, size = "md" }) {
  const normalized = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const config = STATUS_CONFIG[normalized] || {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    label: status ? String(status).replaceAll("_", " ") : "Unknown",
  };

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full whitespace-nowrap shadow-xs ${config.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
