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
  Users,
  Paperclip
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import ConfirmationModal from "../../components/modals/ConfirmationModal";

const Announcement = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [images, setImages] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null });

  // Fetch users when a specific role (like HR) is selected
  useEffect(() => {
    if (targetRole && targetRole !== "all") {
      api.get(`/announcements/users-by-role/${targetRole}`)
        .then(res => setUsersList(res.data.data || []))
        .catch(console.error);
    } else {
      setUsersList([]);
      setTargetUserId("");
    }
  }, [targetRole]);

  /* ================= FETCH ================= */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role?.toLowerCase() === "admin";
      const { data } = await api.get(`/announcements?page=${page}&search=${search}${isAdmin ? '&all=true' : ''}`);
      setAnnouncements(data.data || []);
      setTotalPages(data.pages || 1);

      if (data.data?.length > 0) {
        setSelectedAnnouncement(prev => {
          if (!prev) return data.data[0];
          const updated = data.data.find(a => a._id === prev._id);
          return updated || data.data[0];
        });
      } else {
        setSelectedAnnouncement(null);
      }
    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, search, user]);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!title || !message || !targetRole)
      return toast.error("Please fill all required fields");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);
      formData.append("targetRoles", targetRole);
      if (startDate) formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);
      
      if (targetUserId) {
        formData.append("targetUserId", targetUserId);
        const u = usersList.find((x) => x._id === targetUserId);
        if (u) formData.append("targetUserName", u.name || u.email);
      }

      images.forEach((img) => formData.append("images", img));

      await api.post("/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Broadcast successfully dispatched");
      setShowModal(false);
      setTitle("");
      setMessage("");
      setTargetRole("");
      setTargetUserId("");
      setImages([]);
      setStartDate("");
      setEndDate("");
      setPage(1);
      fetchAnnouncements();
    } catch {
      toast.error("Dispatch failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    setConfirmConfig({ isOpen: true, id });
  };

  const confirmAnnouncementDelete = async () => {
    const id = confirmConfig.id;
    if (!id) return;
    
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Broadcast deleted");
      fetchAnnouncements();
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirmConfig({ isOpen: false, id: null });
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

      {/* BODY - DUAL PANE */}
      <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
        {/* LEFT PANE - LIST */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex-shrink-0 relative">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center z-10">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Megaphone size={16} className="text-indigo-600" />
              Inbox
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{announcements.length} Messages</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {loading && announcements.length === 0 && (
              <div className="p-8 flex justify-center">
                 <Loading message="Fetching broadcasts..." />
              </div>
            )}
            {!loading && announcements.length === 0 && (
               <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                   <CheckCheck size={24} className="text-slate-300" />
                 </div>
                 <h4 className="font-black text-slate-700 mt-2">All Caught Up!</h4>
                 <p className="text-xs mt-1 text-slate-400">No active broadcasts</p>
               </div>
            )}
            {announcements.map((a) => {
              const isUnread = !a.readBy?.some(r => r.userId?.toString() === user?._id);
              const isSelected = selectedAnnouncement?._id === a._id;
              return (
                <div 
                  key={a._id}
                  onClick={() => { setSelectedAnnouncement(a); if(isUnread) markAsRead(a._id); }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border-l-4 ${
                     isSelected ? "bg-indigo-50 border-indigo-600 shadow-sm" : 
                     isUnread ? "bg-white hover:bg-slate-50 border-indigo-400/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" :
                     "bg-white hover:bg-slate-50 border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                   <div className="flex justify-between items-start mb-2">
                     <h4 className={`font-bold pr-2 flex-1 leading-snug ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                       {a.title}
                     </h4>
                     {a.isPinned && <Pin size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                   </div>
                   <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3 pr-2">{a.message}</p>
                   <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-slate-400 flex items-center gap-1.5"><Clock size={12}/> {new Date(a.createdAt).toLocaleDateString()}</span>
                      {isUnread && <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">New</span>}
                   </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANE - DETAILS */}
        <div className="w-full lg:w-2/3 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative h-[600px] lg:h-auto">
           {selectedAnnouncement ? (
             <div className="flex flex-col h-full absolute inset-0">
               <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                 <div className="flex-1">
                   <div className="flex flex-wrap items-center gap-2 mb-4">
                     {selectedAnnouncement.isPinned && (
                       <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2.5 py-1 rounded-md">
                           <Pin size={10} /> Pinned Priority
                       </span>
                     )}
                     {selectedAnnouncement.targetRoles?.map(role => (
                       <span key={role} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                         {role}
                       </span>
                     ))}
                     {selectedAnnouncement.targetUserName && (
                       <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md shadow-sm">
                         <Users size={12} /> {selectedAnnouncement.targetUserName}
                       </span>
                     )}
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedAnnouncement.title}</h2>
                   <div className="text-sm font-bold text-slate-500 mt-3 flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" /> 
                      {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                      <span className="text-slate-300">|</span>
                      <span>From: {selectedAnnouncement.createdBy?.name || 'Admin'}</span>
                   </div>
                 </div>
                 
                 {user?.role === "admin" && (
                   <div className="flex gap-2 ml-4">
                      <button
                         onClick={(e) => { e.stopPropagation(); handlePin(selectedAnnouncement._id); }}
                         className={`p-3 rounded-xl transition-all shadow-sm ${selectedAnnouncement.isPinned ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
                         title={selectedAnnouncement.isPinned ? "Unpin" : "Pin"}
                      >
                         <Pin size={18} fill={selectedAnnouncement.isPinned ? "currentColor" : "none"} />
                      </button>
                      <button
                         onClick={(e) => { e.stopPropagation(); handleDelete(selectedAnnouncement._id); }}
                         className="p-3 bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                         title="Delete"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                 )}
               </div>

               <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg font-medium">{selectedAnnouncement.message}</p>
                  
                  {selectedAnnouncement.images?.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Paperclip size={14} /> Attachments ({selectedAnnouncement.images.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {selectedAnnouncement.images.map((img, i) => (
                          <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer" onClick={() => window.open(img, '_blank')}>
                            <img 
                              src={img} 
                              alt="attachment" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 absolute inset-0 bg-slate-50/30">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                   <Megaphone size={40} className="text-slate-300" />
                 </div>
                 <h3 className="font-black text-2xl text-slate-700 mb-2">No Broadcast Selected</h3>
                 <p className="text-slate-500 font-medium">Select a message from the inbox to view details</p>
             </div>
           )}
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
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1 flex items-center gap-2">
                  <Users size={14} /> User Type (Role)
                </label>

                <select
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl 
                  focus:outline-none focus:ring-4 focus:ring-indigo-600/10 
                  focus:border-indigo-600 transition-all font-semibold text-slate-800"
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    setTargetUserId(""); // reset selected user
                  }}
                >
                  <option value="">-- Select Role --</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="coach">Coach</option>
                  <option value="finance">Finance</option>
                  <option value="all">All Users</option>
                </select>
              </div>

              {targetRole && targetRole !== "all" && usersList.length > 0 && (
                <div className="animate-in fade-in duration-300 slide-in-from-top-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                    Select Specific User (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium text-slate-800"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  >
                    <option value="">-- All {targetRole.toUpperCase()}s --</option>
                    {usersList.map((u) => (
                      <option key={u._id} value={u._id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                  Title
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
                  Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Detail your announcement here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                    Start Date
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-semibold text-slate-700"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                    End Date (Optional)
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-semibold text-slate-700"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">
                  Attach Images (Max 5)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 5) {
                       toast.error("You can only upload up to 5 images");
                       return;
                    }
                    setImages(files);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm font-medium text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end sticky bottom-0">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTitle("");
                  setMessage("");
                  setTargetRole("");
                  setTargetUserId("");
                  setStartDate("");
                  setEndDate("");
                  setImages([]);
                }}
                className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                Submit <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        title="Delete Broadcast"
        message="Are you sure you want to delete this official announcement? This will remove it for all targets."
        confirmText="Confirm Delete"
        onConfirm={confirmAnnouncementDelete}
        onClose={() => setConfirmConfig({ isOpen: false, id: null })}
        type="danger"
      />
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