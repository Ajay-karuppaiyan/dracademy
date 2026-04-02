import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Megaphone,
  Plus,
  Trash2,
  Pin,
  CheckCheck,
  Search,
  BellRing,
  Calendar,
  AlertCircle,
  X,
  Clock,
  Send,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";

const Announcement = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");

  /* ================= FETCH ================= */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/announcements?page=${page}&search=${search}`);
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
      return toast.error("Please fill all required fields");

    try {
      await api.post("/announcements", {
        title,
        message,
        targetRoles,
        expiryDate,
      });

      toast.success("Broadcast successfully dispatched");
      setShowModal(false);
      setTitle("");
      setMessage("");
      setTargetRoles([]);
      setExpiryDate("");
      fetchAnnouncements();
    } catch {
      toast.error("Dispatch failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Broadcast deleted");
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
      toast.error("Error confirming read receipt");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(`/announcements/mark-all`);
      toast.success("All broadcasts acknowledged");
      fetchAnnouncements();
    } catch {
      toast.error("Action failed");
    }
  };

  /* ================= STATS ================= */
  const unreadCount = announcements.filter(
    (a) => !a.readBy?.some((r) => r.userId?.toString() === user?._id)
  ).length;

  const pinnedCount = announcements.filter((a) => a.isPinned).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-700 min-h-screen">
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/30">
              <Megaphone size={14} /> Official Comms
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Platform <span className="text-indigo-400">Broadcasts</span>
            </h1>
            <p className="text-slate-400 max-w-lg text-lg">
              Stay completely up-to-date with essential academy news, maintenance windows, and organizational updates.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <StatCard 
              icon={<BellRing size={20} />} 
              label="Important Action" 
              value={`${unreadCount} Unread`} 
              color={unreadCount > 0 ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-slate-800 text-slate-400 border-slate-700"} 
            />
            <StatCard 
              icon={<Calendar size={20} />} 
              label="Active Total" 
              value={announcements.length} 
              color="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
            />
            <StatCard 
              icon={<Pin size={20} />} 
              label="Pinned Info" 
              value={pinnedCount} 
              color="bg-amber-500/20 text-amber-400 border-amber-500/30 col-span-2 md:col-span-1" 
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -ml-20 -mb-20 pointer-events-none" />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative flex flex-col w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search latest broadcasts..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-sm text-sm font-semibold text-slate-800"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
            >
              <CheckCheck size={18} /> Acknowledge All
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> New Broadcast
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-6">
        
        {loading && announcements.length === 0 && (
          <div className="py-24 flex justify-center">
             <Loading message="Establishing secure connection to broadcast center..." />
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Clear Skies</h3>
            <p className="text-slate-500 mt-2">There are currently no active broadcasts to display.</p>
          </div>
        )}

        {/* ANNOUNCEMENT CARDS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((a) => {
            const isUnread = !a.readBy?.some(
              (r) => r.userId?.toString() === user?._id
            );

            return (
              <div
                key={a._id}
                onClick={() => markAsRead(a._id)}
                className={`group relative flex flex-col p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isUnread
                    ? "bg-gradient-to-br from-indigo-50/50 to-white hover:from-white hover:to-indigo-50 border-indigo-100 shadow-md hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300"
                    : "bg-white border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-lg"
                }`}
              >
                {/* Edge highlight for unread */}
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1.5 pl-2">
                    {a.isPinned && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full w-max">
                        <Pin size={10} /> Pinned Priority
                      </div>
                    )}
                    {isUnread && !a.isPinned && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full w-max">
                        New Message
                      </div>
                    )}
                    <h2 className="font-black text-xl text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                      {a.title}
                    </h2>
                  </div>

                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePin(a._id);
                        }}
                        className={`p-2 rounded-xl transition-colors ${a.isPinned ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"}`}
                        title={a.isPinned ? "Unpin" : "Pin Broadcast"}
                      >
                         <Pin size={16} fill={a.isPinned ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(a._id);
                        }}
                        className="p-2 bg-slate-100 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete Broadcast"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 pl-2 flex-grow">
                  {a.message}
                </p>

                <div className="pt-4 mt-auto border-t border-slate-100/80 flex flex-wrap gap-2 items-center justify-between text-xs font-bold text-slate-400 pl-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} /> 
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {a.targetRoles?.map((role) => (
                      <span
                        key={role}
                        className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider text-[9px]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expiry overlay if present */}
                {a.expiryDate && (
                  <div className="absolute top-4 right-4 translate-x-4 -translate-y-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                     <AlertCircle size={120} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 bg-white inline-flex mx-auto rounded-xl p-1 shadow-sm border border-slate-100">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 font-bold text-sm rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            Previous
          </button>

          <span className="px-4 py-2 font-black text-sm text-indigo-600 bg-indigo-50 rounded-lg">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 font-bold text-sm rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white relative">
               <button 
                 onClick={() => setShowModal(false)}
                 className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
               >
                 <X size={20} />
               </button>
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                 <Send size={24} className="text-white" />
               </div>
               <h2 className="text-2xl font-black tracking-tight mb-1">
                 Dispatch Broadcast
               </h2>
               <p className="text-indigo-200 text-sm">Send official organizational updates</p>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                  Headline
                </label>
                <input
                  type="text"
                  placeholder="E.g., System Maintenance Schedule"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                  Payload Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Detail your announcement here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                  Self-Destruct Date (Optional)
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-semibold text-slate-700"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 pl-1 flex items-center gap-2">
                  <Users size={14} /> Target Audience
                </label>
                <div className="flex flex-wrap gap-2">
                  {["student", "parent", "employee", "hr", "coach", "all"].map(
                    (role) => {
                      const isSelected = targetRoles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            setTargetRoles((prev) =>
                              prev.includes(role)
                                ? prev.filter((r) => r !== role)
                                : [...prev, role]
                            );
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                            isSelected 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                              : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          {role}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end sticky bottom-0">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTitle("");
                  setMessage("");
                  setTargetRoles([]);
                  setExpiryDate("");
                }}
                className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Abort
              </button>

              <button
                onClick={handleCreate}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                Dispatch <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Component for Header Stats
const StatCard = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-2xl border flex flex-col justify-center gap-1 ${color} backdrop-blur-md`}>
    <div className="flex items-center gap-2 mb-1">
      <div className="opacity-80">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
    </div>
    <span className="text-2xl font-black">{value}</span>
  </div>
);

export default Announcement;