import {
  Bell,
  Check,
  LogOut,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getNotifications, getUnreadNotificationCount } from "../../services/notificationService";
import BrandMark from "./BrandMark";
import NotificationPanel from "../maker/NotificationPanel";

export default function Header({ onMenuClick, currentPortal = "maker" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationMenuRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const username = user?.name || user?.username || (currentPortal === "checker" ? "Checker Officer" : "Maker User");
  const isChecker = user?.role === "CHECKER" || currentPortal === "checker";

  const refreshNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const result = await getNotifications();
      const rows = Array.isArray(result) ? result : result?.content || [];
      setNotifications(
        [...rows].sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
      );
    } catch (error) {
      console.error("Unable to load notifications:", error);
      setNotificationsError("Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    const refreshNotificationCount = async () => {
      getUnreadNotificationCount()
        .then(setUnreadCount)
        .catch((error) => {
          console.error("Unable to load notification count:", error);
          setUnreadCount(0);
        });
      if (notificationsOpen) await refreshNotifications();
    };

    refreshNotificationCount();
    window.addEventListener("notifications:changed", refreshNotificationCount);
    return () => window.removeEventListener("notifications:changed", refreshNotificationCount);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!notificationMenuRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open);
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-3 shadow-xs sm:px-5 lg:px-6">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* MOBILE MENU ONLY */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 md:hidden cursor-pointer"
        >
          <Menu size={21} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <BrandMark className="h-7 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                Nishkaiv Solution
              </h1>
              <span
                className={`hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                  isChecker
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {isChecker ? "CHECKER PORTAL" : "MAKER PORTAL"}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              API Onboarding & Management Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1"
          target="_blank"
          rel="noreferrer"
          aria-label="Open Gmail to email the checker"
          title="Email the checker with Gmail"
          className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png"
            alt="Gmail"
            className="mail-icon-animation h-6 w-6"
          />
        </a>

        {/* Notifications */}
        <div ref={notificationMenuRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-controls="header-notifications"
            onClick={toggleNotifications}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
          >
            <Bell size={19} className={unreadCount > 0 ? "notification-bell-animation" : ""} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <section
              id="header-notifications"
              aria-label="Recent notifications"
              className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Notifications</h2>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount ? `${unreadCount} unread` : "You’re all caught up"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount === 0 && <Check size={16} className="text-emerald-600" aria-label="All notifications read" />}
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              {notificationsError ? (
                <p role="alert" className="p-4 text-sm text-red-700">{notificationsError}</p>
              ) : notificationsLoading && notifications.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500">Loading notifications…</p>
              ) : (
                <div className="max-h-[min(65vh,26rem)] overflow-y-auto p-3">
                  <NotificationPanel
                    notifications={notifications.slice(0, 5)}
                    onNotificationOpen={() => setNotificationsOpen(false)}
                  />
                </div>
              )}
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate(isChecker ? "/checker/notifications" : "/notifications");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  View all notifications
                </button>
              </div>
            </section>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <UserCircle size={22} className={isChecker ? "text-purple-600" : "text-blue-600"} />
          </div>

          <div className="hidden lg:block">
            <p className="max-w-36 truncate text-xs font-bold text-slate-800">
              {username}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {isChecker ? "Reviewer & Approver" : "API Requester"}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer ml-1"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}