import { useState } from "react";
import { NavLink } from "react-router-dom";

function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function SubscriptionIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.1.1l1.4-1.4a5 5 0 0 0-7.1-7.1L10 6" />
      <path d="M14 11a5 5 0 0 0-7.1-.1L5.5 12.3a5 5 0 0 0 7.1 7.1L14 18" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: <HomeIcon />,
  },
  {
    label: "New Request",
    path: "/requests/new",
    icon: <RequestIcon />,
  },
  {
    label: "Subscriptions",
    path: "/subscriptions",
    icon: <SubscriptionIcon />,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: <NotificationIcon />,
  },
];

export default function Sidebar({
  onCollapseChange,
  mobileOpen = false,
  onMobileClose,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newState = !collapsed;

    setCollapsed(newState);
    onCollapseChange?.(newState);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50
        flex h-screen flex-col
        border-r border-blue-100
        bg-white shadow-sm
        transition-all duration-300
        w-[230px]

        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

        md:translate-x-0
        ${collapsed ? "md:w-[68px]" : "md:w-[230px]"}
      `}
    >
      {/* Sidebar Header */}
      <div
        className={`
          flex h-16 shrink-0 items-center
          border-b border-blue-100

          ${
            collapsed
              ? "justify-center"
              : "justify-between px-4"
          }
        `}
      >
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#17264d]">
              API ONBOARDING
            </p>

            <p className="text-[9px] text-gray-400">
              Maker Portal
            </p>
          </div>
        )}

        {/* DESKTOP SIDEBAR MENU ONLY */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 md:flex"
        >
          <span className="flex flex-col gap-[4px]">
            <span className="block h-[2px] w-[20px] rounded bg-current" />
            <span className="block h-[2px] w-[20px] rounded bg-current" />
            <span className="block h-[2px] w-[20px] rounded bg-current" />
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            title={collapsed ? item.label : undefined}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `
                flex h-11 items-center rounded-md
                text-sm transition

                ${
                  collapsed
                    ? "justify-center"
                    : "gap-3 px-3"
                }

                ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }
              `
            }
          >
            {item.icon}

            {!collapsed && (
              <span>{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 border-t border-gray-100 p-3">
          <p className="text-[9px] text-gray-400">
            API Onboarding Platform
          </p>

          <p className="mt-1 text-[9px] text-gray-400">
            Maker
          </p>
        </div>
      )}
    </aside>
  );
}