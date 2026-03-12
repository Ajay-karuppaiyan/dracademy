import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  Lock,
  ChevronLeft,
} from "lucide-react";
import api from "../../services/api";

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
          Back to Catalog
        </button>

        {/* Video / Document Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          
          <div className="aspect-video bg-black flex items-center justify-center">
            {activeLesson ? (
              activeLesson.type === "video" ? (
                activeLesson.url ? (
                  <iframe
                    src={activeLesson.url}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-white text-center">
                    <PlayCircle size={60} className="mx-auto opacity-70" />
                    <p className="mt-2 text-sm">Video not available</p>
                  </div>
                )
              ) : (
                <div className="text-gray-700 text-center">
                  <FileText size={50} className="mx-auto text-gray-400" />
                  <p className="font-medium mt-2">Document Resource</p>
                  <a
                    href={activeLesson.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 text-sm underline mt-1 inline-block"
                  >
                    Download File
                  </a>
                </div>
              )
            ) : (
              <p className="text-white">Select a lesson to start</p>
            )}
          </div>

          {/* Lesson Info */}
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {activeLesson?.title || course.title}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description}
            </p>
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

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {course.lessons?.map((lesson) => (
            <button
              key={lesson._id}
              onClick={() => setActiveLesson(lesson)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                activeLesson?._id === lesson._id
                  ? "bg-brand-50 border border-brand-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="mt-1 text-gray-500">
                {lesson.type === "video" ? (
                  <PlayCircle size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {lesson.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {lesson.duration}
                </p>
              </div>

              {!lesson.isFree && (
                <Lock size={14} className="text-gray-300 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;