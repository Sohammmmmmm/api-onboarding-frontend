import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

export default function PublisherLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-transparent font-sans">
      {/* Sidebar for Publisher Portal */}
      <Sidebar
        portalRole="PUBLISHER"
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? "md:pl-[72px]" : "md:pl-[240px]"
        }`}
      >
        <Header
          currentPortal="publisher"
          onMenuClick={() => setMobileMenuOpen((open) => !open)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
