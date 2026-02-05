import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to determine page title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes("/dashboard/lms")) return "My Learning";
    if (p.includes("/dashboard/enroll")) return "Enroll New Class";
    if (p.includes("/dashboard/attendance")) return "My Attendance";
    if (p.includes("/dashboard/subscription")) return "Subscription Plan";
    if (p.includes("/dashboard/timetable")) return "Class Time Table";
    if (p.includes("/hr")) return "Employee Management";
    if (p.includes("/finance")) return "Finance";
    if (p.includes("/students")) return "Student Management";
    if (p.includes("/admin")) return "Administration";
    if (p.includes("/settings")) return "Settings";
    return "Overview Dashboard";
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileSidebarOpen}
        closeMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {/* Top Header */}
        <DashboardHeader
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          title={getPageTitle()}
        />
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
