import React, { useState, useEffect, useRef } from "react";
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
import api from "../services/api";

const TopNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

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

  const allItems =
    user?.role === "admin" ? [...navItems, ...adminItems] : navItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔔 Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // 🔥 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
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
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 relative">

            <button className="p-2 text-slate-400 hover:text-brand-700 transition-colors">
              <Search size={20} />
            </button>

            {/* 🔔 Notification */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="p-2 text-slate-400 hover:text-brand-700 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-[9999]">
                  <div className="p-3 border-b font-semibold">
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`p-3 text-sm border-b cursor-pointer hover:bg-slate-100 ${
                          !n.isRead ? "bg-blue-50 font-medium" : ""
                        }`}
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Mobile Menu */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-md"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Items */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-200">
          <div className="pt-2 pb-3 space-y-1">
            {allItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-100"
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50"
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