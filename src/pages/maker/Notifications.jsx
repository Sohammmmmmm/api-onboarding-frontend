import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import NotificationPanel from "../../components/maker/NotificationPanel";
import { getNotifications, markNotificationRead } from "../../services/notificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(Array.isArray(response) ? response : response?.content || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((notification) => !notification.read);
      await Promise.all(unread.map((notification) => markNotificationRead(notification.id)));
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Stay updated about your onboarding requests.</p>
        </div>

        {notifications.some((notification) => !notification.read) && (
          <button type="button" onClick={markAllRead} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto">
            <Check size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4">{error}</div>}
      <NotificationPanel notifications={notifications} />
    </div>
  );
}
