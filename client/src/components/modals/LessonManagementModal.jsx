import React, { useState } from "react";
import { X, Trash2, Plus, PlayCircle, FileText, ChevronRight, Upload, CircleDashed } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const LessonManagementModal = ({ course, isOpen, onUpdate, onClose }) => {
  const [lessons, setLessons] = useState(course?.lessons || []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newLesson, setNewLesson] = useState({
    title: "",
    type: "video",
    url: "",
    duration: "",
    isFree: false,
    topicIndex: 0
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Auto-detect type
    const extension = file.name.split('.').pop().toLowerCase();
    const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(extension);
    const isDoc = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'].includes(extension);

    setUploading(true);
    const formData = new FormData();
    formData.append("lessonFile", file);

    try {
      const { data } = await api.post("/courses/upload-lesson-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setNewLesson((prev) => ({ 
        ...prev, 
        url: data.url,
        type: isVideo ? "video" : isDoc ? "document" : prev.type,
        title: prev.title || file.name.split('.').slice(0, -1).join('.')
      }));
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title) return toast.error("Title is required");
    if (!newLesson.url) return toast.error("Resource URL or File is required");
    
    setLoading(true);
    try {
      const updatedLessons = [...lessons, newLesson];
      const { data } = await api.put(`/courses/${course._id}`, {
        lessons: updatedLessons
      });
      setLessons(data.lessons);
      setNewLesson({ title: "", type: "video", url: "", duration: "", isFree: false, topicIndex: 0 });
      toast.success("Lesson added!");
      onUpdate();
    } catch (err) {
      toast.error("Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (index) => {
    if (!window.confirm("Delete this lesson?")) return;
    
    setLoading(true);
    try {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      const { data } = await api.put(`/courses/${course._id}`, {
        lessons: updatedLessons
      });
      setLessons(data.lessons);
      toast.success("Lesson deleted");
      onUpdate();
    } catch (err) {
      toast.error("Failed to delete lesson");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage Curriculum</h2>
            <p className="text-slate-500 text-sm mt-1">Course: <span className="text-brand-600 font-bold">{course.title}</span></p>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all rounded-full shadow-sm border border-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Form Side */}
          <div className="w-full md:w-[380px] p-8 border-r border-gray-100 overflow-y-auto bg-slate-50/30">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest px-1">New Lesson Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Title</label>
                  <input
                    type="text"
                    placeholder="Enter lesson title..."
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                    value={newLesson.title}
                    onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Type</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm appearance-none"
                      value={newLesson.type}
                      onChange={e => setNewLesson({...newLesson, type: e.target.value})}
                    >
                      <option value="video">Video</option>
                      <option value="document">Document/PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Topic Group</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm appearance-none"
                      value={newLesson.topicIndex}
                      onChange={e => setNewLesson({...newLesson, topicIndex: parseInt(e.target.value)})}
                    >
                      {course.syllabus?.map((s, i) => (
                        <option key={i} value={i}>{s.topic || `Module ${i+1}`}</option>
                      ))}
                      {!course.syllabus?.length && <option value="0">No Topics</option>}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Upload File (Optional)</label>
                  <label className="cursor-pointer group">
                    <div className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${
                      uploading ? 'bg-slate-50 border-brand-200' : 'bg-white border-gray-200 hover:border-brand-500 hover:bg-brand-50/30'
                    }`}>
                      {uploading ? (
                        <CircleDashed className="animate-spin text-brand-600 mb-2" size={24} />
                      ) : (
                        <Upload className="text-slate-400 group-hover:text-brand-600 mb-2 transition-colors" size={24} />
                      )}
                      <p className="text-xs font-bold text-slate-600">
                        {uploading ? "Uploading..." : "Click to upload resource"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">MP4, PDF, DOCX up to 50MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Resource URL (or Auto-filled)</label>
                  <input
                    type="text"
                    placeholder="URL (Embedded link or Download link)"
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                    value={newLesson.url}
                    onChange={e => setNewLesson({...newLesson, url: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    {newLesson.type === 'video' ? 'Duration (mins)' : 'Reading Time (approx)'}
                  </label>
                  <input
                    type="text"
                    placeholder={newLesson.type === 'video' ? "e.g. 10 mins" : "e.g. 5 mins read"}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                    value={newLesson.duration}
                    onChange={e => setNewLesson({...newLesson, duration: e.target.value})}
                  />
                </div>

                <button
                  onClick={handleAddLesson}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  {loading ? "Processing..." : "Add to Curriculum"}
                </button>
              </div>
            </div>
          </div>

          {/* List Side */}
          <div className="flex-1 p-8 overflow-y-auto scrollbar-hidden">
            <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-6 px-1">Curriculum Hierarchy</h3>
            
            <div className="space-y-8">
              {(course.syllabus?.length ? course.syllabus : [{ topic: "Uncategorized", topicIndex: 0 }]).map((topic, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50" />
                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{topic.topic || `Module ${idx+1}`}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 ml-5">
                    {lessons.filter(l => l.topicIndex === idx).map((lesson, lIdx) => (
                      <div key={lIdx} className="group bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${lesson.type === 'video' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {lesson.type === 'video' ? <PlayCircle size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{lesson.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">{lesson.duration || "No duration"}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteLesson(lessons.indexOf(lesson))}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {!lessons.find(l => l.topicIndex === idx) && (
                      <div className="py-8 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider italic">No lessons in this module</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonManagementModal;