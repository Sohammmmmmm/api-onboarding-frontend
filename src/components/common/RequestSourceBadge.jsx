import { Mail, Monitor } from "lucide-react";

export default function RequestSourceBadge({ source }) {
  const normalized = String(source || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  const isEmail = ["EMAIL", "MAIL"].includes(normalized);
  const isPortal = ["PORTAL", "MAKER_PORTAL", "WEB_PORTAL"].includes(normalized);

  if (!isEmail && !isPortal) return <span className="text-slate-400">—</span>;

  const Icon = isEmail ? Mail : Monitor;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-semibold ${
        isEmail
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-indigo-200 bg-indigo-50 text-indigo-800"
      }`}
    >
      <Icon size={12} aria-hidden="true" />
      {isEmail ? "Email" : "Portal"}
    </span>
  );
}
