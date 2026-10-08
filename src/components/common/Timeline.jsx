import { Clock, User, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function Timeline({ events = [], title = "Lifecycle Timeline" }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
        No timeline events recorded.
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Clock size={16} className="text-blue-600" />
        <span>{title}</span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => {
          const isSystem = String(evt.actor || "").toUpperCase().includes("SYSTEM");
          const isSuccess = String(evt.action || evt.remarks || "").toUpperCase().includes("PUBLISH") || String(evt.action || "").toUpperCase().includes("APPROV");
          
          return (
            <div key={idx} className="relative group">
              {/* Point icon */}
              <div
                className={`absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs ${
                  isSuccess
                    ? "bg-emerald-500 ring-4 ring-emerald-100"
                    : isSystem
                    ? "bg-slate-500 ring-4 ring-slate-100"
                    : "bg-blue-600 ring-4 ring-blue-100"
                }`}
              >
                {idx + 1}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {evt.time || evt.timestamp || "Today"}
                  </span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <User size={12} className="text-slate-400" />
                    <span>{evt.actor || "User"}</span>
                  </span>
                  {evt.role && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {evt.role}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-700 font-medium leading-relaxed">
                {evt.action || evt.remarks || evt.details || "Action recorded"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
