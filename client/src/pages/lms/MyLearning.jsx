import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, Clock, GraduationCap } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const MyLearning = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await api.get("/courses/mine");
        setCourses(data);
      } catch (error) {
        console.error("Error fetching my courses:", error);
        toast.error("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          My Classes
        </h1>
        <p className="text-slate-500">
          Continue where you left off and finish your path to mastery.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-2xl border border-slate-100"
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              {course.thumbnail?.url ? (
                <img
                  src={course.thumbnail.url}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <BookOpen size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                  <PlayCircle size={32} />
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-widest text-brand-600">
                  <GraduationCap size={16} /> Enrolled
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {course.duration} {course.durationUnit}s
                </span>
              </div>

              <h3 className="mb-6 text-xl font-black text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                {course.title}
              </h3>

              {/* Progress Simulation */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5">
                  <span>Course Progress</span>
                  <span>30%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-[30%] rounded-full transition-all duration-1000" />
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  to={`/dashboard/lms/course/${course._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                >
                  <PlayCircle size={18} /> Resume Learning
                </Link>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">
              You aren't enrolled in any classes yet.
            </p>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              Explore our catalog to find your next challenge.
            </p>
            <Link
              to="/dashboard/enroll"
              className="inline-flex items-center gap-2 text-brand-600 font-black hover:underline"
            >
              Browse Available Classes <PlayCircle size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;
