import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Star } from "lucide-react";
import api from "../../services/api";

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get("/courses");
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
        <div className="flex gap-2">
          <select className="rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 px-3 text-sm">
            <option>All Categories</option>
            <option>Development</option>
            <option>Design</option>
            <option>Business</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg border border-gray-100"
          >
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x250?text=Course+Thumbnail";
                }}
              />
              <div className="absolute top-2 right-2 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-brand-600">
                {course.level}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} /> {course.category}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />{" "}
                  {course.rating} ({course.numReviews})
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2">
                {course.title}
              </h3>
              <p className="mb-4 text-sm text-gray-500 line-clamp-2">
                {course.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div className="text-lg font-bold text-gray-900">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </div>
                <Link
                  to={`/lms/course/${course._id}`}
                  className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No courses available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
