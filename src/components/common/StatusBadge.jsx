const statusStyles = {
  RECEIVED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  AI_ANALYZED: "bg-purple-100 text-purple-700",
  PENDING_REVIEW: "bg-orange-100 text-orange-700",
  CLARIFICATION_REQUIRED: "bg-pink-100 text-pink-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  SUBSCRIBED: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate-100 text-slate-700";
  const formattedStatus = status ? status.replaceAll("_", " ") : "UNKNOWN";

  return <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-center text-[10px] font-semibold leading-4 sm:text-xs ${style}`}>{formattedStatus}</span>;
}
