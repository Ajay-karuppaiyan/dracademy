import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Star,
  Download,
  X,
  Award,
  BookOpen,
  Volume2,
  Settings,
  Maximize2,
  Minimize2,
  List,
  Target,
  Trophy,
  Share2
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.includes("vimeo.com")) {
    const vimeoId = url.split("/").pop();
    return `https://player.vimeo.com/video/${vimeoId}`;
  }
  return url;
};

const isDirectVideo = (url) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || url.includes("res.cloudinary.com");
};

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [userProgress, setUserProgress] = useState(0);

  // Initialize expandedModules when course is loaded
  useEffect(() => {
    if (course && course. सिलेबस) {
      // Auto-open the module containing the active lesson
      const activeModuleIndex = activeLesson?.topicIndex ?? 0;
      setExpandedModules(prev => ({ ...prev, [activeModuleIndex]: true }));
    } else if (course) {
      setExpandedModules({ 0: true });
    }
  }, [course, activeLesson?.topicIndex]);

  const toggleModule = (idx) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };


  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        // Sort lessons by topicIndex to ensure hierarchy
        if (data.lessons) {
          data.lessons.sort((a, b) => (a.topicIndex || 0) - (b.topicIndex || 0));
        }
        setCourse(data);

        const { data: mine } = await api.get("/courses/mine");
        const currentEnrollment = mine.find(e => e.course._id === id);

        if (currentEnrollment) {
          setUserProgress(currentEnrollment.progress || 0);
          setIsCompleted(currentEnrollment.completed || false);

          const lessonIdx = Math.min(
            data.lessons.length - 1,
            Math.floor((currentEnrollment.progress / 100) * data.lessons.length)
          );
          setActiveLesson(data.lessons[lessonIdx] || data.lessons[0]);

          if (currentEnrollment.completed) {
            try {
              const { data: certData } = await api.get(`/courses/${id}/certificate`);
              setCertificate(certData);
            } catch (e) { }
          }
        } else {
          setActiveLesson(data.lessons[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeLesson]);

  const currentIndex = course?.lessons?.findIndex(l => l._id === activeLesson?._id) ?? -1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === (course?.lessons?.length - 1);

  const updateProgress = async (prog) => {
    try {
      await api.post(`/courses/${id}/progress`, { progress: prog });
      setUserProgress(prog);
      if (prog >= 100 && !isCompleted) {
        setIsCompleted(true);
        setShowFeedbackModal(true);
        const { data: certData } = await api.get(`/courses/${id}/certificate`);
        setCertificate(certData);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const activeModuleLessons = course?.lessons?.filter(l => l.topicIndex === activeLesson?.topicIndex) || [];
  const activeModuleLessonIndex = activeModuleLessons.findIndex(l => l._id === activeLesson?._id);
  const isLastInSection = activeModuleLessonIndex === (activeModuleLessons.length - 1);

  const handleNext = () => {
    if (!isLast) {
      const nextIndex = currentIndex + 1;
      const nextProgress = Math.max(userProgress, Math.round((nextIndex / course.lessons.length) * 100));
      updateProgress(nextProgress);
      setActiveLesson(course.lessons[nextIndex]);
    } else {
      updateProgress(100);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setActiveLesson(course.lessons[currentIndex - 1]);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.post(`/courses/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment
      });
      toast.success("Feedback submitted! Thank you.");
      setShowFeedbackModal(false);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
        <p className="font-black text-slate-400 text-sm uppercase tracking-widest animate-pulse">Establishing Session...</p>
      </div>
    </div>
  );

  if (!course) return (
    <div className="flex h-screen items-center justify-center text-slate-500 font-bold">
      Course access denied or not found.
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white selection:bg-brand-100 selection:text-brand-900">
      {/* Top Header */}
      <header className="z-30 flex h-20 items-center justify-between border-b border-slate-100 bg-white px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/lms")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="hidden sm:block">
            <h2 className="max-w-[300px] truncate text-lg font-black text-slate-900">{course.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">Module {activeLesson?.topicIndex + 1 || 1}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-bold text-slate-400 lowercase tracking-wide">{activeLesson?.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Progress Ring / Circle */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Overall progress</p>
              <p className="text-sm font-black text-slate-900 leading-none">{userProgress}%</p>
            </div>
            <div className="relative h-10 w-10">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-brand-600" strokeWidth="4" strokeDasharray={`${userProgress}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target size={12} className="text-brand-600" />
              </div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-100" />

          {isCompleted && (
            <button
              onClick={() => navigate(`/dashboard/lms/certificate/${id}`)}
              className="group flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95"
            >
              <Award size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">View Certificate</span>
              <span className="md:hidden">Certificate</span>
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${sidebarOpen ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
          >
            <List size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 no-scrollbar relative">
          <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Player Shell */}
            <div className={`mb-8 overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 ring-1 ring-slate-100/50`}>
              <div className={`${activeLesson?.type === 'document' ? 'h-[600px] lg:h-[800px]' : 'aspect-video'} bg-slate-900 group relative`}>
                {activeLesson ? (
                  activeLesson.type === "video" ? (
                    activeLesson.url ? (
                      isDirectVideo(activeLesson.url) ? (
                        <video src={activeLesson.url} controls className="h-full w-full object-contain" controlsList="nodownload" />
                      ) : (
                        <iframe
                          src={getEmbedUrl(activeLesson.url)}
                          title={activeLesson.title}
                          className="h-full w-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      )
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-500">
                        <PlayCircle size={64} strokeWidth={1} />
                        <p className="mt-4 font-bold">Video Resource Not Found</p>
                      </div>
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-white">
                      {activeLesson.url && activeLesson.url.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={`${activeLesson.url}#toolbar=0`}
                          title={activeLesson.title}
                          className="h-full w-full border-0"
                        />
                      ) : activeLesson.url && (activeLesson.url.includes('.doc') || activeLesson.url.includes('.ppt') || activeLesson.url.includes('.xls')) ? (
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.url)}&embedded=true`}
                          title={activeLesson.title}
                          className="h-full w-full border-0"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-12 text-slate-300 bg-slate-900 w-full text-center">
                          <div className="relative mb-8">
                            <div className="absolute -inset-8 bg-brand-600/10 rounded-full blur-2xl animate-pulse" />
                            <FileText size={80} className="text-brand-600 relative z-10" />
                          </div>
                          <h3 className="text-3xl font-black text-white mb-4">Reading Material</h3>
                          <p className="text-slate-500 max-w-sm text-center mb-8 font-medium">This document format might not support direct preview. Download to view.</p>
                          <a
                            href={activeLesson.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-3xl font-black shadow-lg hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                          >
                            <Download size={22} className="text-brand-600" />
                            Download Resource
                          </a>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  </div>
                )}

                {/* Visual Overlays for immersion */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                  <div className="h-4 w-4 bg-brand-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,1)]" />
                </div>
              </div>

              {/* Lesson Metadata Area */}
              <div className="bg-white p-10">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-100">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ring-4 ring-slate-100">
                        {activeLesson?.type || "Lesson"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Step {activeLesson?.topicIndex + 1 || 1} • Section {activeModuleLessonIndex + 1} of {activeModuleLessons.length}
                      </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                      {activeLesson?.title}
                    </h1>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100">
                      <Share2 size={20} />
                    </button>
                    <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100">
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none mb-12">
                  <p className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Description</p>
                  <div className="text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                    {activeLesson?.description || "Explore this lesson carefully. Take notes of key concepts and complete any associated challenges."}
                  </div>
                </div>

                {/* Immersion Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100">
                    <h4 className="flex items-center gap-2 text-brand-900 font-black mb-2 uppercase tracking-widest text-xs">
                      <Trophy size={16} className="text-brand-600" /> Lesson Goals
                    </h4>
                    <ul className="space-y-2 text-sm text-brand-700 font-medium">
                      <li>• Achieve 100% understanding of the core concept.</li>
                      <li>• Complete any practical assignments provided.</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="flex items-center gap-2 text-slate-900 font-black mb-2 uppercase tracking-widest text-xs">
                      <Settings size={16} className="text-slate-400" /> Support
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">Need help? Join the discussion forum for this module to connect with other students.</p>
                  </div>
                </div>

                {/* Footer Nav */}
                <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                  <button
                    onClick={handlePrevious}
                    disabled={isFirst}
                    className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-sm transition-all ${isFirst ? "opacity-20 translate-x-4 pointer-events-none" : "hover:bg-slate-100 text-slate-600"
                      }`}
                  >
                    <ArrowLeft size={20} /> Preview Lesson
                  </button>

                  <button
                    onClick={handleNext}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-[2rem] bg-slate-900 px-10 py-5 font-black text-white shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="relative z-10">
                      {isLast ? "Finish Course" : isLastInSection ? `Continue to Step ${activeLesson?.topicIndex + 2}` : "Next Section"}
                    </span>
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                      {isLast ? <Trophy size={16} className="text-brand-400" /> : <ArrowRight size={18} />}
                    </div>
                    {/* Gloss effect */}
                    <div className="absolute top-0 -inset-x-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer" />
                  </button>
                </div>
              </div>
            </div>

            {/* Completion / Certificate Promo */}
            {isCompleted && certificate && (
              <div className="group relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600 via-brand-600 to-brand-800 p-1 bg-[length:200%_200%] animate-gradient-flow shadow-2xl shadow-brand-600/30 mb-8">
                <div className="bg-slate-900/10 backdrop-blur-md rounded-[2.9rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8 text-center md:text-left">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white blur-3xl opacity-20 animate-pulse" />
                      <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative z-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Award size={48} className="text-brand-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-brand-300 font-black uppercase tracking-[0.3em] text-xs">Achievement Unlocked</p>
                      <h3 className="text-4xl text-white font-black leading-none">Course Mastered</h3>
                      <p className="text-brand-100/60 font-medium">Your professional certificate is ready for download.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/lms/certificate/${id}`)}
                    className="bg-white text-slate-900 h-16 px-10 rounded-2xl font-black text-sm hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                  >
                    <Trophy size={20} className="text-brand-600" /> Unlock Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Curriculum (Right) */}
        <aside className={`${
          sidebarOpen ? "translate-x-0 w-[450px]" : "translate-x-full w-0"
        } absolute md:relative right-0 top-0 h-full bg-white border-l border-slate-100 transition-all duration-[600ms] cubic-bezier(0.4, 0, 0.2, 1) z-40 flex flex-col shadow-2xl md:shadow-none overflow-hidden overflow-y-auto`}>
           
           <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-10 p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
             <div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Learning Path</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.lessons?.length} Modules in this path</p>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="hover:bg-slate-50 p-2 rounded-xl text-slate-400 transition-colors group">
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
             </button>
           </div>
           
           <div className="flex-1 p-4 space-y-4">
              {(course.syllabus?.length ? course.syllabus : [{ topic: "Core Curriculum" }]).map((topic, topicIdx) => {
                const topicLessons = course.lessons?.filter(l => l.topicIndex === topicIdx) || [];
                if (!topicLessons.length && course.syllabus?.length) return null;

                const isExpanded = expandedModules[topicIdx];
                const activeInThisModule = topicLessons.some(l => l._id === activeLesson?._id);

                return (
                  <div key={topicIdx} className={`rounded-3xl border transition-all duration-300 ${
                    isExpanded ? "border-slate-100 bg-white shadow-sm" : "border-transparent bg-slate-50/50"
                  }`}>
                     <button 
                       onClick={() => toggleModule(topicIdx)}
                       className="w-full flex items-center justify-between p-5 text-left group"
                     >
                        <div className="flex items-center gap-4">
                           <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${
                             activeInThisModule ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20 shadow-glow" : "bg-white text-slate-400 border border-slate-100"
                           }`}>
                              <span className="text-sm font-black">{topicIdx + 1}</span>
                           </div>
                           <div>
                             <h4 className={`text-sm font-black transition-colors ${
                               activeInThisModule ? "text-brand-600" : "text-slate-900"
                             }`}>
                               {topic.topic || `Step ${topicIdx + 1}`}
                             </h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               {topicLessons.length} Sections
                             </p>
                           </div>
                        </div>
                        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                           <ChevronDown size={18} className="text-slate-400" />
                        </div>
                     </button>

                     <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                       isExpanded ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0"
                     }`}>
                        <div className="px-4 space-y-2 relative">
                           {/* Vertical Path Line */}
                           <div className="absolute left-[38px] top-0 bottom-6 w-[2px] bg-slate-100" />

                           {topicLessons.map((lesson) => {
                             const lessonIdx = course.lessons.findIndex(l => l._id === lesson._id);
                             const isActive = activeLesson?._id === lesson._id;
                             const isFinished = Math.round((userProgress / 100) * course.lessons.length) > lessonIdx || isCompleted;
                             const isLocked = !isActive && !isFinished && lessonIdx > Math.round((userProgress / 100) * course.lessons.length);

                             return (
                               <button
                                 key={lesson._id}
                                 onClick={() => {
                                   if (!isLocked) {
                                      setActiveLesson(lesson);
                                      // Auto-close on mobile if screen is small
                                      if (window.innerWidth < 1024) setSidebarOpen(false);
                                   }
                                 }}
                                 disabled={isLocked}
                                 className={`group w-full relative flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                   isActive 
                                     ? "bg-slate-50 ring-1 ring-slate-200 z-10" 
                                     : isLocked 
                                       ? "opacity-50 grayscale cursor-not-allowed" 
                                       : "hover:bg-slate-50/50"
                                 }`}
                               >
                                  {/* Milestone Indicator */}
                                  <div className={`relative z-10 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center transition-colors ml-2 ${
                                     isActive ? "bg-brand-600 ring-2 ring-brand-100 scale-110 shadow-lg shadow-brand-600/30" : isFinished ? "bg-brand-500 ring-1 ring-brand-50" : "bg-slate-100 ring-1 ring-slate-100"
                                  }`} />

                                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                                     isActive ? "bg-white text-brand-600 shadow-sm" : isFinished ? "bg-brand-50 text-brand-600" : "bg-white text-slate-300 border border-slate-50"
                                  }`}>
                                     {isFinished ? <CheckCircle2 size={18} strokeWidth={2.5} /> : lesson.type === "video" ? <PlayCircle size={18} /> : <FileText size={18} />}
                                  </div>

                                  <div className="flex-1 text-left min-w-0">
                                     <p className={`text-xs font-black leading-tight truncate ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                                       {lesson.title}
                                     </p>
                                     <div className="mt-1 flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-md">{lesson.duration || "5m"} </span>
                                        <span className="text-[9px] font-black uppercase text-brand-500 tracking-wider">{lesson.type}</span>
                                     </div>
                                  </div>

                                  {isLocked && <Lock size={12} className="text-slate-400" />}
                               </button>
                             );
                           })}
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>

           {/* Feedback Trigger in sidebar */}
           {isCompleted && !certificate && (
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 mt-auto">
                 <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-5 rounded-2xl font-black text-xs text-slate-600 hover:shadow-xl transition-all active:scale-95 group"
                 >
                   <Star size={18} className="text-brand-500 group-hover:scale-125 transition-transform" /> 
                   <span>Share Experience</span>
                 </button>
              </div>
           )}
        </aside>
      </div>

      {/* ================= MODALS ================= */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            <div className="p-12 relative text-center">
              <button onClick={() => setShowFeedbackModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 transition-colors">
                <X size={28} />
              </button>

              <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-brand-50 text-brand-600 mb-8 relative">
                <Star size={48} fill="currentColor" />
                <div className="absolute -inset-4 border-2 border-brand-100 rounded-[2.5rem] animate-spin-slow" />
              </div>

              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How was this journey?</h2>
              <p className="text-slate-500 font-medium mb-10 text-lg">Your insights help us craft even better paths to mastery.</p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Course Quality</p>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`h-16 w-16 rounded-2xl transition-all duration-300 group flex items-center justify-center ${feedbackRating >= star ? "bg-brand-600 text-white shadow-xl shadow-brand-600/30 -translate-y-1" : "bg-slate-50 text-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        <Star size={32} fill={feedbackRating >= star ? "currentColor" : "none"} strokeWidth={3} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">Share your thoughts</p>
                  <textarea
                    required
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="What was the most impactfull part of the course? Any suggestions?"
                    rows={4}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-900 font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  disabled={submittingFeedback}
                  className="w-full bg-slate-900 text-white h-20 rounded-3xl font-black text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/40 active:scale-95 flex items-center justify-center gap-3"
                >
                  {submittingFeedback ? "Sending your review..." : "Publish Feedback"}
                  <ArrowRight size={24} className="text-brand-400" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind Animations & Utilities */}
      <style>{`
        @keyframes shimmer {
          100% { left: 150%; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          animation: gradient-flow 15s ease infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;