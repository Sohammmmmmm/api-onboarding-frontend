import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

export default function MakerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      {/* Sidebar */}
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileSidebar}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            md:hidden
          "
        />
      )}

      {/* Main Application Area */}
      <div
        className={`
          min-h-screen
          min-w-0
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? "md:ml-[68px]"
              : "md:ml-[230px]"
          }
        `}
      >
        {/* Header */}
        <Header
          onMenuClick={openMobileSidebar}
        />

        {/* Page Content */}
        <main
          className="
            min-w-0
            p-3
            sm:p-4
            md:p-5
            lg:p-6
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}