import {
  Bell,
  LogOut,
  Menu,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getNotifications } from "../../services/notificationService";

export default function Header({ onMenuClick }) {
  const { keycloak, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const username =
    keycloak?.tokenParsed?.preferred_username ||
    keycloak?.tokenParsed?.name ||
    "Maker";

  const loadNotificationCount = async () => {
    try {
      const response = await getNotifications();

      const notificationList = Array.isArray(response)
        ? response
        : response?.content || [];

      const unread = notificationList.filter(
        (notification) => !notification.read
      );

      setUnreadCount(unread.length);
    } catch (error) {
      console.error("Unable to load notification count:", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotificationCount();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">
      
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">

        {/* MOBILE MENU ONLY */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 md:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-800 sm:text-lg">
            API Onboarding Portal
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Maker Portal
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
        >
          <Bell size={19} />

          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
          <UserCircle
            size={28}
            className="shrink-0 text-blue-600 sm:h-8 sm:w-8"
          />

          <div className="hidden lg:block">
            <p className="max-w-32 truncate text-sm font-semibold text-slate-700">
              {username}
            </p>

            <p className="text-xs text-slate-500">
              Maker
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}