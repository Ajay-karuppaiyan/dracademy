import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DashboardHeader = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      if (!n.isRead) {
        await api.patch(`/notifications/${n._id}/read`);
      }

      if (n.link) navigate(n.link);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === n._id ? { ...item, isRead: true } : item
        )
      );

      setShowNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "leave_approved":
        return "✅";
      case "leave_rejected":
        return "❌";
      case "leave_applied":
        return "📩";
      case "payment_received":
        return "💰";
      default:
        return "🔔";
    }
  };

  return (
    <header className="bg-white h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b sticky top-0 z-40">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-slate-600 hover:text-slate-800"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* 🔔 Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() =>
              setShowNotifications((prev) => !prev)
            }
            className="relative p-2 text-slate-600 hover:text-slate-800"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[9px] sm:text-[10px] bg-red-500 text-white rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>

{showNotifications && (
  <div
    className="
      absolute
      mt-3
      left-1/2 -translate-x-1/2
      w-[92vw] max-w-sm
      sm:left-auto sm:translate-x-0 sm:right-0 sm:w-80
      bg-white
      rounded-xl
      shadow-2xl
      border
      z-50
    "
  >
    {/* Header */}
    <div className="p-3 border-b flex justify-between items-center">
      <span className="text-sm font-semibold">
        Notifications
      </span>

      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          className="text-xs text-brand-600 hover:underline"
        >
          Mark all
        </button>
      )}
    </div>

    {/* Body */}
    <div className="max-h-72 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="p-4 text-sm text-slate-500 text-center">
          No notifications
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNotificationClick(n)}
            className={`p-3 border-b cursor-pointer transition ${
              !n.isRead
                ? "bg-blue-50"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="flex gap-3">
              <div className="text-lg mt-1">
                {getIcon(n.type)}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {n.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {n.message}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  {new Date(
                    n.createdAt
                  ).toLocaleString()}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 bg-brand-600 rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
        </div>

        {/* 👤 Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() =>
              setShowProfileMenu((prev) => !prev)
            }
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-700 text-white flex items-center justify-center text-sm font-semibold overflow-hidden border border-slate-200 shadow-sm transition-transform hover:scale-105">
              {user?.profilePic?.url ? (
                <img src={user.profilePic.url} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || <User size={14} />
              )}
            </div>

            <ChevronDown
              size={14}
              className="hidden sm:block"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <button
                onClick={() =>
                  navigate("/dashboard/profile")
                }
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <User size={14} />
                Profile
              </button>

              <button
                onClick={() =>
                  navigate("/dashboard/settings")
                }
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings
                  size={14}
                  className="inline mr-2"
                />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut
                  size={14}
                  className="inline mr-2"
                />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;