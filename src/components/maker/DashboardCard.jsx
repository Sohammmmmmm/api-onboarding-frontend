export default function DashboardCard({ title, value, description, icon: Icon, iconClass = "bg-blue-100 text-blue-600" }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">{value}</h3>
          {description && <p className="mt-2 break-words text-xs text-slate-500">{description}</p>}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 sm:p-3 ${iconClass}`}>{Icon && <Icon size={21} />}</div>
      </div>
    </div>
  );
}
