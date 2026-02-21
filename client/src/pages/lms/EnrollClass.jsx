import React, { useEffect, useState } from "react";
import {
  BookOpen,
  IndianRupee,
  Star,
  GraduationCap,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const EnrollClass = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/courses/available");
      setCourses(data);
    } catch (error) {
      console.error("Error fetching available courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

const handleEnroll = async (course) => {
  try {
    if (course.price === 0) {
      await api.post(`/courses/${course._id}/enroll-free`);
      toast.success("Enrolled successfully");
      fetchAvailableCourses();
      return;
    }

    // 1️⃣ Create Order
    const { data } = await api.post("/payment/create-order", {
      courseId: course._id,
    });

    const options = {
      key: "rzp_test_43B9POe4e23YRY",
      amount: data.amount, // paise
      currency: data.currency,
      name: "Dr Academy",
      description: course.title,
      order_id: data.orderId,

      handler: async function (response) {
        try {
          // 2️⃣ Verify Payment
          await api.post("/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId: course._id,
          });

          toast.success("Payment successful 🎉");
          fetchAvailableCourses();

        } catch (err) {
          toast.error("Verification failed. Contact support.");
        }
      },

      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
        },
      },

      theme: {
        color: "#2563eb",
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment failure
    rzp.on("payment.failed", function (response) {
      toast.error("Payment failed. Try again.");
      console.error(response.error);
    });

    rzp.open();

  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Payment failed");
  }
};

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
          Available Classes
        </h1>
        <p className="text-slate-500">
          Pick a course and start your learning journey tonight.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 border border-slate-100"
          >
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
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
              <div className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase text-brand-600 shadow-sm backdrop-blur-sm">
                {course.level}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-widest">
                  <BookOpen size={14} className="text-brand-500" />{" "}
                  {course.category}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Clock size={14} /> {course.duration} {course.durationUnit}s
                </span>
              </div>

              <h3 className="mb-2 text-xl font-black text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                {course.title}
              </h3>
              <p className="mb-6 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="text-2xl font-black text-slate-900 flex items-center">
                  {course.price === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <>
                      <IndianRupee size={20} className="mr-0.5" />
                      {course.price}
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleEnroll(course)}
                  className="rounded-2xl bg-brand-600 px-6 py-2.5 text-sm font-black text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <GraduationCap size={18} /> Enroll Now
                </button>
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
              No new courses available to enroll right now.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Check back later for new programs!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollClass;
