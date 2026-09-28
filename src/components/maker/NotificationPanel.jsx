import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const getIcon = (type) => {
  if (type?.includes("APPROVED") || type?.includes("SUBSCRIPTION")) return CheckCircle2;
  if (type?.includes("REJECTED") || type?.includes("CLARIFICATION")) return AlertCircle;
  return Info;
};

export default function NotificationPanel({ notifications = [] }) {
  if (!notifications.length) {
    return <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><p className="text-sm text-slate-500">No notifications.</p></div>;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type);
        return (
          <div key={notification.id} className={`flex gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4 ${notification.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}>
            <div className="mt-0.5 shrink-0"><Icon size={19} className="text-blue-600" /></div>
            <div className="min-w-0 flex-1">
              <h4 className="break-words text-sm font-semibold text-slate-800">{notification.title}</h4>
              <p className="mt-1 break-words text-sm leading-5 text-slate-600">{notification.message}</p>
              {notification.createdAt && <p className="mt-2 break-words text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
