import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Megaphone,
  Plus,
  Trash2,
  Pin,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const Announcement = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");

  /* ================= FETCH ================= */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/announcements?page=${page}`
      );

      // correct structure
      setAnnouncements(data.data || []);
      setTotalPages(data.pages || 1);

    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, search]);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!title || !message || targetRoles.length === 0)
      return toast.error("Fill all fields");

    try {
      await api.post("/announcements", {
        title,
        message,
        targetRoles,
        expiryDate,
      });

      toast.success("Announcement Created");
      setShowModal(false);
      setTitle("");
      setMessage("");
      setTargetRoles([]);
      setExpiryDate("");
      fetchAnnouncements();
    } catch {
      toast.error("Creation failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Deleted");
      fetchAnnouncements();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= PIN ================= */
  const handlePin = async (id) => {
    try {
      await api.patch(`/announcements/${id}/pin`);
      fetchAnnouncements();
    } catch {
      toast.error("Pin failed");
    }
  };

  /* ================= READ ================= */
  const markAsRead = async (id) => {
    try {
      await api.patch(`/announcements/${id}/read`);
      fetchAnnouncements();
    } catch {
      toast.error("Error marking as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(`/announcements/mark-all`);
      toast.success("All marked as read");
      fetchAnnouncements();
    } catch {
      toast.error("Failed");
    }
  };

  /* ================= UNREAD COUNT ================= */
  const unreadCount = announcements.filter(
    (a) =>
      !a.readBy?.some((r) => r.userId?.toString() === user?._id)
  ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Megaphone className="text-blue-600" size={26} />
          <h1 className="text-2xl font-bold text-gray-800">
            Announcements
          </h1>

          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <CheckCheck size={16} />
              Mark All
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              Add Announcement
            </button>
          )}
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Search announcements..."
        className="w-full md:w-80 p-3 mb-6 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {loading && (
          <p className="text-gray-500">Loading...</p>
        )}

        {!loading && announcements.length === 0 && (
          <p className="text-gray-500">No announcements found.</p>
        )}

        {announcements.map((a) => {
          const isUnread = !a.readBy?.some(
            (r) => r.userId?.toString() === user?._id
          );

          return (
            <div
              key={a._id}
              onClick={() => markAsRead(a._id)}
              className={`p-5 rounded-xl border cursor-pointer transition hover:shadow-lg ${
                isUnread
                  ? "bg-yellow-50 border-yellow-400"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">
                    {a.title}
                  </h2>
                  {a.isPinned && (
                    <span className="text-xs text-blue-600 font-medium">
                      📌 Pinned
                    </span>
                  )}
                </div>

                {user?.role === "admin" && (
                  <div className="flex gap-3">
                    <Pin
                      size={16}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePin(a._id);
                      }}
                    />
                    <Trash2
                      size={16}
                      className="text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(a._id);
                      }}
                    />
                  </div>
                )}
              </div>

              <p className="text-gray-600 mt-2">
                {a.message}
              </p>

              <div className="text-xs text-gray-500 mt-3 flex flex-wrap gap-2">
                <span>
                  {new Date(a.createdAt).toLocaleString()}
                </span>

                {a.expiryDate && (
                  <span className="text-red-500">
                    Expires:{" "}
                    {new Date(a.expiryDate).toLocaleDateString()}
                  </span>
                )}

                {a.targetRoles?.map((role) => (
                  <span
                    key={role}
                    className="bg-gray-200 px-2 py-1 rounded capitalize"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl animate-fadeIn">
            
            <h2 className="text-xl font-semibold mb-6">
              Create Announcement
            </h2>

            {/* Title */}
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title"
              className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Message */}
            <label className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              rows="4"
              placeholder="Enter announcement message"
              className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* Calendar Label Added */}
            <label className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />

            {/* Target Roles */}
            <label className="block text-sm font-medium mb-2">
              Target Roles
            </label>
            <div className="flex flex-wrap gap-4 mb-6">
              {["student", "parent", "employee", "hr", "coach", "all"].map(
                (role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 text-sm capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={targetRoles.includes(role)}
                      onChange={() =>
                        setTargetRoles((prev) =>
                          prev.includes(role)
                            ? prev.filter((r) => r !== role)
                            : [...prev, role]
                        )
                      }
                    />
                    {role}
                  </label>
                )
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">

              <button
                onClick={() => {
                  setShowModal(false);
                  setTitle("");
                  setMessage("");
                  setTargetRoles([]);
                  setExpiryDate("");
                }}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;