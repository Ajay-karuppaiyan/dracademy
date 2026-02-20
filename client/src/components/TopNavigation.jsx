import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  GraduationCap,
  ShieldCheck,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TopNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
    { icon: <BookOpen size={18} />, label: "LMS", path: "/dashboard/lms" },
    { icon: <Users size={18} />, label: "HR", path: "/dashboard/hr" },
    { icon: <DollarSign size={18} />, label: "Finance", path: "/dashboard/finance" },
    { icon: <GraduationCap size={18} />, label: "Students", path: "/dashboard/students" },
  ];

  const adminItems = [
    { icon: <ShieldCheck size={18} />, label: "Admin", path: "/dashboard/admin/courses" },
  ];

  const allItems = user?.role === "admin" ? [...navItems, ...adminItems] : navItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-700 text-white p-1.5 rounded-lg shadow-sm">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">
              DRRJ Academy
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:ml-8 md:space-x-4">
            {allItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-brand-700 text-brand-800"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`
                }
              >
                <span className="mr-2 opacity-70 group-hover:opacity-100">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-400 hover:text-brand-700 transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-brand-700 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-200">
          <div className="pt-2 pb-3 space-y-1">
            {allItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-base font-medium ${
                    isActive
                      ? "bg-brand-50 border-l-4 border-brand-500 text-brand-800"
                      : "border-l-4 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-base font-medium border-l-4 border-transparent text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <span className="mr-3">
                <LogOut size={18} />
              </span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavigation;
