import { useState } from "react";
import { ArrowRight, Bell, CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { markNotificationRead } from "../../services/notificationService";

const notificationStyle = (type) => {
  if (type?.includes("REJECT")) return { Icon: XCircle, color: "text-rose-600", background: "bg-rose-50" };
  if (type?.includes("CLARIFICATION")) return { Icon: MessageSquare, color: "text-amber-600", background: "bg-amber-50" };
  if (type?.includes("APPROV") || type?.includes("SUBSCRIPTION")) return { Icon: CheckCircle, color: "text-emerald-600", background: "bg-emerald-50" };
  return { Icon: Bell, color: "text-blue-600", background: "bg-blue-50" };
};

export default function NotificationPanel({ notifications = [], onNotificationOpen }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isChecker = user?.role === "CHECKER";
  const [pendingId, setPendingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const openNotification = async (notification, requestId) => {
    const id = notification.id ?? notification.notificationId;
    setActionError("");

    if (!notification.read && id) {
      setPendingId(id);
      try {
        await markNotificationRead(id);
      } catch (error) {
        console.error("Unable to mark notification as read:", error);
        setActionError("Unable to mark this notification as read. Please try again.");
        setPendingId(null);
        return;
      }
      setPendingId(null);
    }

    navigate(`${isChecker ? "/checker/requests" : "/requests"}/${encodeURIComponent(requestId)}`);
    onNotificationOpen?.();
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
        <Bell size={28} className="mx-auto text-slate-300" />
        <h2 className="mt-3 text-sm font-semibold text-slate-800">No notifications yet</h2>
        <p className="mt-1 text-xs text-slate-500">Updates about your requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}
      {notifications.map((notification) => {
        const { Icon, color, background } = notificationStyle(notification.type || "");
        const requestId = notification.requestId || notification.requestID;
        const notificationId = notification.id ?? notification.notificationId;

        return (
          <button
            key={notificationId || `${notification.title}-${notification.createdAt}`}
            type="button"
            disabled={!requestId || pendingId === notificationId}
            onClick={() => openNotification(notification, requestId)}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
              notification.read
                ? "border-slate-200 bg-white hover:bg-slate-50"
                : "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
            } disabled:cursor-default ${pendingId === notificationId ? "cursor-wait opacity-70" : ""}`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${background} ${color}`}>
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800">{notification.title || "Request update"}</span>
                {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">{notification.message}</span>
              <span className="mt-2 block text-[11px] text-slate-400">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ""}
              </span>
            </span>
            {requestId && <ArrowRight size={16} className="mt-1 shrink-0 text-slate-400" />}
          </button>
        );
      })}
    </div>
  );
}