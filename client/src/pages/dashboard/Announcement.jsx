import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Megaphone,
  Plus,
  Edit3,
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
  Paperclip,
  LayoutGrid,
  ChevronRight,
  Maximize2,
  Filter
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
  const [editAnnouncementId, setEditAnnouncementId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
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
  const resetForm = () => {
    setTitle("");
    setMessage("");
    setTargetRole("");
    setTargetUserId("");
    setImages([]);
    setUsersList([]);
    setStartDate("");
    setEndDate("");
    setEditAnnouncementId(null);
    setIsEditMode(false);
    setExistingImages([]);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setEditAnnouncementId(announcement._id);
    setIsEditMode(true);
    setTitle(announcement.title || "");
    setMessage(announcement.message || "");
    setTargetRole(announcement.targetRoles?.[0] || "");
    setTargetUserId(announcement.targetUserId || "");
    setExistingImages(announcement.images || []);
    setImages([]);
    setStartDate(announcement.startDate ? announcement.startDate.slice(0, 10) : "");
    setEndDate(announcement.endDate ? announcement.endDate.slice(0, 10) : "");
    setShowModal(true);
  };

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
      resetForm();
      setPage(1);
      fetchAnnouncements();
    } catch {
      toast.error("Dispatch failed");
    }
  };

  const handleUpdate = async () => {
    if (!title || !message || !targetRole)
      return toast.error("Please fill all required fields");
    if (!editAnnouncementId)
      return toast.error("No announcement selected for update");

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

      await api.patch(`/announcements/${editAnnouncementId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Broadcast updated successfully");
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
      setShowDetailModal(false);
    } catch {
      toast.error("Update failed");
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

      // If last item on page → go to previous page
      if (announcements.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchAnnouncements();
      }
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


  /* ================= STATS ================= */
  const unreadCount = announcements.filter(
    (a) => !a.readBy?.some((r) => r.userId?.toString() === user?._id)
  ).length;

  const pinnedCount = announcements.filter((a) => a.isPinned).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700 min-h-screen">
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="space-y-5 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 backdrop-blur-md">
              <Megaphone size={14} /> Official Communication
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Academy <span className="text-indigo-400">Broadcasts</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
              Stay informed with official announcements, institutional updates, and critical system alerts from Dr. Academy.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 w-full lg:w-auto">
            <StatCard 
              icon={<BellRing size={20} />} 
              label="Pending" 
              value={unreadCount} 
              type="primary"
            />
            <StatCard 
              icon={<Calendar size={20} />} 
              label="Recent" 
              value={announcements.length} 
              type="secondary"
            />
            <StatCard 
              icon={<Pin size={20} />} 
              label="Pinned" 
              value={pinnedCount} 
              type="warning"
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
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

          {user?.role === "admin" && (
            <button
              onClick={openCreateModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> New Broadcast
            </button>
          )}
        </div>
      </div>

      {/* ANNOUNCEMENTS GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutGrid size={20} className="text-indigo-600" />
              Latest Broadcasts
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["all", "unread", "pinned"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Filter size={14} />
            Showing {announcements.length} items
          </div>
        </div>

        {loading && announcements.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Loading message="Fetching institutional broadcasts..." />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCheck size={32} className="text-slate-300" />
            </div>
            <h4 className="text-xl font-black text-slate-800">All Caught Up!</h4>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">No active broadcasts found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements
              .filter(a => {
                if (activeTab === "unread") return !a.readBy?.some(r => r.userId?.toString() === user?._id);
                if (activeTab === "pinned") return a.isPinned;
                return true;
              })
              .map((a) => {
                const isUnread = !a.readBy?.some((r) => r.userId?.toString() === user?._id);
                return (
                  <div
                    key={a._id}
                    onClick={() => {
                      setSelectedAnnouncement(a);
                      setShowDetailModal(true);
                      if (isUnread) markAsRead(a._id);
                    }}
                    className={`group bg-white rounded-[2rem] border p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer relative flex flex-col h-full ${
                      isUnread ? "border-indigo-400/30" : "border-slate-100"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        {a.isPinned && (
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Pin size={14} fill="currentColor" />
                          </div>
                        )}
                        {isUnread && (
                          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse flex items-center shadow-lg shadow-indigo-600/30">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Clock size={12} /> {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <h4 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                      {a.title}
                    </h4>
                    
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">
                      {a.message}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {a.targetRoles?.slice(0, 2).map((role) => (
                          <div key={role} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black uppercase tracking-tighter text-slate-600" title={role}>
                            {role.slice(0, 2)}
                          </div>
                        ))}
                        {a.targetRoles?.length > 2 && (
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-indigo-600">
                            +{a.targetRoles.length - 2}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 group/btn">
                        <span className="text-xs font-black text-slate-400 group-hover/btn:text-indigo-600 transition-colors uppercase tracking-[0.1em]">Open Details</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white transition-transform group-hover/btn:translate-x-1 group-hover/btn:bg-indigo-600">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Decorative accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/10 blur-3xl -mr-12 -mt-12 rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* DETAILED VIEW MODAL */}
      {showDetailModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in zoom-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-50/50">
               <button 
                 onClick={() => setShowDetailModal(false)}
                 className="absolute top-6 right-6 p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all text-slate-600 group active:scale-95 z-10"
               >
                 <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
               </button>

               <div className="flex-1 space-y-4 pr-10">
                 <div className="flex flex-wrap items-center gap-2">
                   {selectedAnnouncement.isPinned && (
                     <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200">
                         <Pin size={12} fill="currentColor" /> Priority Update
                     </span>
                   )}
                   {selectedAnnouncement.targetRoles?.map(role => (
                     <span key={role} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                       {role}
                     </span>
                   ))}
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedAnnouncement.title}</h2>
                 <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                       <Clock size={16} className="text-indigo-500" /> 
                       {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                       <Users size={16} className="text-indigo-500" />
                       Published by {selectedAnnouncement.createdBy?.name || 'Academic Board'}
                    </div>
                 </div>
               </div>

               {user?.role === "admin" && (
                  <div className="flex gap-2">
                     <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(selectedAnnouncement); }}
                        className="px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                     >
                        <Edit3 size={14} />
                        Edit
                     </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); handlePin(selectedAnnouncement._id); }}
                        className={`px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest ${selectedAnnouncement.isPinned ? "bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-200" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
                     >
                        <Pin size={14} fill={selectedAnnouncement.isPinned ? "currentColor" : "none"} />
                        {selectedAnnouncement.isPinned ? "Pinned" : "Pin"}
                     </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(selectedAnnouncement._id); }}
                        className="p-2.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-100 hover:border-rose-200 transition-all shadow-sm group"
                     >
                        <Trash2 size={18} className="group-hover:shake" />
                     </button>
                  </div>
               )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 md:p-12 scrollbar-thin bg-white">
               <div className="max-w-3xl">
                 <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg font-medium">
                   {selectedAnnouncement.message}
                 </p>
                 
                 {selectedAnnouncement.images?.length > 0 && (
                   <div className="mt-12 pt-8 border-t border-slate-100">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                       <Paperclip size={14} className="text-indigo-600" /> Resources & Attachments
                     </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {selectedAnnouncement.images.map((img, i) => (
                         <div 
                           key={i} 
                           className="group relative aspect-video rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 cursor-zoom-in bg-slate-50" 
                           onClick={() => window.open(img, '_blank')}
                         >
                           <img 
                             src={img} 
                             alt="attachment" 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                           />
                           <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                              <Maximize2 className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" size={32} />
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
               <button 
                 onClick={() => setShowDetailModal(false)}
                 className="px-10 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95 uppercase tracking-widest text-xs"
               >
                 Close Broadcast
               </button>
            </div>
          </div>
        </div>
      )}

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
            
            <div className="bg-slate-900 p-8 text-white relative">
               <button 
                 onClick={() => setShowModal(false)}
                 className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
               >
                 <X size={20} />
               </button>
               
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-indigo-500/30">
                   <Megaphone size={24} className="text-indigo-400" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight mb-2">
                   {isEditMode ? "Edit " : "Dispatch " }<span className="text-indigo-400">Broadcast</span>
                 </h2>
                 <p className="text-slate-400 text-sm font-medium">
                   {isEditMode ? "Update the announcement and target audience." : "Create and send official institutional updates to your community."}
                 </p>
               </div>
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
                {isEditMode && existingImages.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">Existing attachments: {existingImages.length}. Upload new images to replace them.</p>
                )}
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
                onClick={isEditMode ? handleUpdate : handleCreate}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                {isEditMode ? "Update" : "Submit"} <Send size={16} />
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
const StatCard = ({ icon, label, value, type }) => {
  const styles = {
    primary: "bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/20",
    secondary: "bg-white/10 text-white border-white/20 backdrop-blur-md",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 backdrop-blur-md"
  };

  return (
    <div className={`p-5 rounded-[1.5rem] border flex flex-col justify-center gap-1.5 transition-all hover:scale-105 duration-300 ${styles[type]}`}>
      <div className="flex items-center gap-2.5">
        <div className={type === 'primary' ? 'text-white/80' : 'text-current opacity-70'}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">{label}</span>
      </div>
      <span className="text-3xl font-black tracking-tight">{value}</span>
    </div>
  );
};

export default Announcement;