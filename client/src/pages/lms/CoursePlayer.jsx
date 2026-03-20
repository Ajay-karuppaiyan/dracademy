import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import api from "../../services/api";

const getEmbedUrl = (url) => {
  if (!url) return "";

  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  // Vimeo
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
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
        if (data.lessons?.length > 0) {
          setActiveLesson(data.lessons[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLesson]);

  const currentIndex = course?.lessons?.findIndex(l => l._id === activeLesson?._id) ?? -1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === (course?.lessons?.length - 1);

  const handleNext = () => {
    if (!isLast) {
      setActiveLesson(course.lessons[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setActiveLesson(course.lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-gray-50 p-6 gap-6">
      
      {/* ================= LEFT SIDE (Player Section) ================= */}
      <div className="flex-1 flex flex-col space-y-4">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600 transition"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </button>

        {/* Video / Document Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          
          <div className="aspect-video bg-black flex items-center justify-center">
            {activeLesson ? (
              activeLesson.type === "video" ? (
                activeLesson.url ? (
                  isDirectVideo(activeLesson.url) ? (
                    <video
                      src={activeLesson.url}
                      controls
                      className="w-full h-full"
                      controlsList="nodownload"
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(activeLesson.url)}
                      title={activeLesson.title}
                      className="w-full h-full border-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  )
                ) : (
                  <div className="text-white text-center">
                    <PlayCircle size={60} className="mx-auto opacity-70" />
                    <p className="mt-2 text-sm">Video not available</p>
                  </div>
                )
              ) : (
                <div className="text-gray-700 text-center w-full px-10">
                  <div className="bg-slate-50 border border-slate-100 p-12 rounded-3xl flex flex-col items-center">
                    <FileText size={64} className="text-brand-300 mb-6" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">{activeLesson.title}</h3>
                    <p className="text-sm text-slate-500 mb-8">This resource is available for download and offline viewing.</p>
                    <a
                      href={activeLesson.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                    >
                      Download Resource
                    </a>
                  </div>
                </div>
              )
            ) : (
              <p className="text-white">Select a lesson to start</p>
            )}
          </div>

          {/* Lesson Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {course.syllabus?.[activeLesson?.topicIndex]?.topic || "General"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    Lesson {currentIndex + 1} of {course.lessons?.length}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeLesson?.title || course.title}
                </h1>
              </div>
              <div className="flex gap-2 text-xs font-bold text-slate-400 capitalize bg-slate-50 px-3 py-1.5 rounded-xl self-start h-fit border border-slate-100">
                {activeLesson?.type} Resource
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {course.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                onClick={handlePrevious}
                disabled={isFirst}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isFirst 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft size={18} /> Previous
              </button>

              <button
                onClick={handleNext}
                disabled={isLast}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isLast
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 active:scale-95"
                }`}
              >
                {isLast ? (
                  <>Course Completed <CheckCircle2 size={18} /></>
                ) : (
                  <>Complete & Next <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE (Curriculum) ================= */}
      <div className="w-full md:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Course Content
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {course.lessons?.length || 0} Lessons
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {(course.syllabus?.length ? course.syllabus : [{ topic: "Lessons" }]).map((topic, topicIdx) => {
            const topicLessons = course.lessons?.filter(l => l.topicIndex === topicIdx) || [];
            if (!topicLessons.length && course.syllabus?.length) return null;
            
            return (
              <div key={topicIdx} className="space-y-2">
                <div className="flex items-center gap-2 px-2 mb-3">
                  <div className="h-4 w-1 bg-brand-600 rounded-full" />
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
                    {topic.topic || `Module ${topicIdx + 1}`}
                  </h4>
                </div>
                
                {topicLessons.map((lesson) => (
                  <button
                    key={lesson._id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full group flex items-start gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                      activeLesson?._id === lesson._id
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1"
                        : "bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100"
                    }`}
                  >
                    <div className={`mt-0.5 ${activeLesson?._id === lesson._id ? "text-brand-400" : "text-slate-300 group-hover:text-brand-500"} transition-colors`}>
                      {lesson.type === "video" ? (
                        <PlayCircle size={20} />
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>
      
                    <div className="flex-1">
                      <p className={`text-sm font-bold leading-snug line-clamp-2 ${activeLesson?._id === lesson._id ? "text-white" : "text-slate-700"}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className={`text-[10px] font-medium ${activeLesson?._id === lesson._id ? "text-slate-400" : "text-slate-400"}`}>
                          {lesson.duration || "Self-paced"}
                        </p>
                      </div>
                    </div>
      
                    {!lesson.isFree && activeLesson?._id !== lesson._id && (
                      <Lock size={12} className="text-slate-200 mt-1" />
                    )}
                    
                    {activeLesson?._id === lesson._id && (
                      <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center animate-pulse">
                        <ArrowRight size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;