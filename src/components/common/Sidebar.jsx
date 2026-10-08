import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  BookOpen,
  Layers,
  KeyRound,
  Bell,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  Settings,
  Users,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import BrandMark from "./BrandMark";

export default function Sidebar({
  onCollapseChange,
  mobileOpen = false,
  onMobileClose,
  portalRole,
}) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const activeRole = String(portalRole || user?.role || "MAKER")
    .toUpperCase()
    .replace(/^ROLE_/, "");

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const makerMenuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={19} />,
    },
    {
      label: "New Request",
      path: "/requests/new",
      icon: <FilePlus size={19} />,
    },
    {
      label: "My Subscriptions",
      path: "/subscriptions",
      icon: <KeyRound size={19} />,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: <Bell size={19} />,
    },
  ];

  const checkerMenuItems = [
    {
      label: "Dashboard",
      path: "/checker",
      icon: <LayoutDashboard size={19} />,
    },
    {
      label: "API Inventory",
      path: "/checker/catalogue",
      icon: <Layers size={19} />,
    },
    {
      label: "Clarifications",
      path: "/checker/clarifications",
      icon: <MessageSquare size={19} />,
    },
    {
      label: "Notifications",
      path: "/checker/notifications",
      icon: <Bell size={19} />,
    },
  ];

  const publisherMenuItems = [
    {
      label: "Dashboard",
      path: "/publisher",
      icon: <LayoutDashboard size={19} />,
    },
    {
      label: "Pending Publication",
      path: "/publisher/pending-publication",
      icon: <Clock3 size={19} />,
    },
    {
      label: "Published APIs",
      path: "/publisher/published",
      icon: <Layers size={19} />,
    },
  ];

  const adminMenuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={19} />,
    },
    {
      label: "Applications",
      path: "/admin/applications",
      icon: <ClipboardList size={19} />,
    },
    {
      label: "API Catalogue",
      path: "/admin/catalogue",
      icon: <Database size={19} />,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: <Users size={19} />,
    },
    {
      label: "Master Configuration",
      path: "/admin/master-configuration",
      icon: <Settings size={19} />,
    },
    {
      label: "SLA Configuration",
      path: "/admin/sla",
      icon: <Clock3 size={19} />,
    },
    {
      label: "Audit Logs",
      path: "/admin/audit",
      icon: <ShieldCheck size={19} />,
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: <Bell size={19} />,
    },
  ];

  const menuItems = {
    CHECKER: checkerMenuItems,
    PUBLISHER: publisherMenuItems,
    ADMIN: adminMenuItems,
  }[activeRole] || makerMenuItems;
  const portalNames = {
    MAKER: "MAKER PORTAL",
    CHECKER: "CHECKER PORTAL",
    PUBLISHER: "PUBLISHER PORTAL",
    ADMIN: "ADMIN PORTAL",
  };
  const activeItemClass = {
    CHECKER: "bg-purple-50 text-purple-700",
    PUBLISHER: "bg-emerald-50 text-emerald-700",
    ADMIN: "bg-amber-50 text-amber-700",
  }[activeRole] || "bg-blue-50 text-blue-700";

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50
        flex h-screen flex-col
        border-r border-slate-200
        bg-white shadow-sm
        transition-all duration-300
        w-[240px]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${collapsed ? "md:w-[72px]" : "md:w-[240px]"}
      `}
    >
      {/* Sidebar Header */}
      <div
        className={`
          flex h-16 shrink-0 items-center
          border-b border-slate-100 px-4
          ${collapsed ? "justify-center" : "justify-between"}
        `}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
              <BrandMark className="h-7 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900 uppercase tracking-wider">
                {portalNames[activeRole] || portalNames.MAKER}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Nishkaiv Solution
              </p>
            </div>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={
              item.path === "/" ||
              item.path === "/checker" ||
              item.path === "/publisher" ||
              item.path === "/admin"
            }
            title={collapsed ? item.label : undefined}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `
                flex h-10 items-center rounded-lg
                text-xs font-semibold transition
                ${collapsed ? "justify-center px-0" : "gap-3 px-3"}
                ${
                  isActive
                    ? `${activeItemClass} shadow-2xs`
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 border-t border-slate-100 p-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-medium text-slate-600">Environment: UAT</p>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Nishkaiv API Gateway v2.4</p>
        </div>
      )}
    </aside>
  );
}