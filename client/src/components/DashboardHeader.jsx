import React, { useState, useEffect } from "react";
import { Search, Bell, Menu, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClick = (e) => {
      if (!e.target.closest(".profile-dropdown")) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfileMenu]);

  return (
    <header className="bg-white h-20 px-6 sm:px-10 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-100 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-brand-500 w-64"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200"></div>

          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex items-center gap-2 w-auto px-2 py-1 rounded-full bg-brand-100 border border-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              title="Profile"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-sm shadow">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || <User size={18} />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {user?.name?.split(" ")[0]}
              </span>
              <ChevronDown className="hidden sm:block text-slate-400" size={14} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-xl py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-brand-600 font-medium capitalize">{user?.role} Account</p>
                  {user?.email && (
                    <p className="text-xs text-slate-500 truncate mt-1">Email: {user.email}</p>
                  )}
                  {user?.phone && (
                    <p className="text-xs text-slate-500 truncate">Phone: {user.phone}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col">
                  <button
                    onClick={() => navigate("/dashboard/settings")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
