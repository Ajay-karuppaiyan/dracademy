import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PlayCircle,
  CheckCircle,
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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
        if (data.lessons && data.lessons.length > 0) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center p-10">Course not found.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <Link
            to="/lms"
            className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600"
          >
            <ChevronLeft size={16} className="mr-1" /> Back to Catalog
          </Link>
        </div>

        <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-lg mb-4 relative">
          {activeLesson ? (
            activeLesson.type === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <PlayCircle
                    size={64}
                    className="mx-auto mb-2 opacity-80 hover:opacity-100 cursor-pointer"
                  />
                  <p>Video Player Placeholder</p>
                  <p className="text-sm text-gray-400">{activeLesson.url}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold">Document Viewer</p>
                  <a href="#" className="text-brand-600 underline text-sm mt-2">
                    Download Resource
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Select a lesson to start
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {activeLesson?.title || course.title}
          </h1>
          <p className="text-gray-600">{course.description}</p>
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900">Course Content</h3>
          <p className="text-xs text-gray-500 mt-1">
            {course.lessons?.length || 0} Lessons
          </p>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {course.lessons?.map((lesson, index) => (
            <button
              key={index}
              onClick={() => setActiveLesson(lesson)}
              className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                activeLesson?._id === lesson._id
                  ? "bg-brand-50 text-brand-700"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="mt-0.5">
                {lesson.type === "video" ? (
                  <PlayCircle size={16} />
                ) : (
                  <FileText size={16} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-1">
                  {lesson.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lesson.duration}
                </p>
              </div>
              {/* Assuming we'll add progress tracking later, showing lock for now if not free/enrolled */}
              {!lesson.isFree && <Lock size={14} className="text-gray-300" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
