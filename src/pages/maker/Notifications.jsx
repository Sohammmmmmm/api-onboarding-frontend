import { useCallback, useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import NotificationPanel from "../../components/maker/NotificationPanel";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../../services/notificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const response = await getNotifications();
      setNotifications(Array.isArray(response) ? response : response?.content || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    window.addEventListener("notifications:changed", loadNotifications);
    return () => {
      clearInterval(timer);
      window.removeEventListener("notifications:changed", loadNotifications);
    };
  }, [loadNotifications]);

  const handleMarkAll = async () => {
    setError("");
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error(err);
      setError("Unable to mark notifications as read.");
    }
  };

  if (loading) return <Loader />;

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Stay updated about your onboarding requests.</p>
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4">{error}</div>}
      <NotificationPanel notifications={notifications} />
    </div>
  );
}
