import React, { useEffect, useState } from "react";
import { BookOpen, IndianRupee, GraduationCap, Clock } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const EnrollClass = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  /////////////////////////////////////////////////////////////
  // FETCH COURSES
  /////////////////////////////////////////////////////////////
  const fetchAvailableCourses = async (studentIdParam) => {
    try {
      setLoading(true);

      let url = "/courses/available";

      if (user?.role === "parent" && studentIdParam) {
        url += `?studentId=${studentIdParam}`;
      }

      const { data } = await api.get(url);
      setCourses(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  /////////////////////////////////////////////////////////////
  // FETCH CHILDREN (FOR PARENT)
  /////////////////////////////////////////////////////////////
  const fetchChildren = async () => {
    try {
      const { data } = await api.get("/parent/children");

      setChildren(data);

      if (data.length > 0) {
        const firstStudent = data[0]._id;
        setSelectedStudent(firstStudent);
        fetchAvailableCourses(firstStudent);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load children");
    }
  };

  /////////////////////////////////////////////////////////////
  // INITIAL LOAD
  /////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    if (user.role === "parent") {
      fetchChildren();
    } else {
      fetchAvailableCourses();
    }
  }, [user]);

  /////////////////////////////////////////////////////////////
  // ENROLL FUNCTION
  /////////////////////////////////////////////////////////////
  const handleEnroll = async (course) => {
    try {
      let studentId = user?._id;

      if (user?.role === "parent") {
        if (!selectedStudent) {
          toast.error("Please select a student");
          return;
        }
        studentId = selectedStudent;
      }

      /////////////////////////////////////////////////////////////
      // FREE COURSE
      /////////////////////////////////////////////////////////////
      if (course.price === 0) {
        await api.post(`/courses/${course._id}/enroll-free`, { studentId });
        toast.success("Enrolled successfully 🎉");
        fetchAvailableCourses(studentId);
        return;
      }

      /////////////////////////////////////////////////////////////
      // CREATE ORDER
      /////////////////////////////////////////////////////////////
      const { data } = await api.post("/payment/create-order", {
        courseId: course._id,
        studentId,
      });

      /////////////////////////////////////////////////////////////
      // RAZORPAY OPTIONS
      /////////////////////////////////////////////////////////////
      const options = {
        key: "rzp_test_43B9POe4e23YRY",
        amount: data.amount,
        currency: data.currency,
        name: "Dr Academy",
        description: course.title,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Log all values for debugging
            console.log("Razorpay response:", response);
            if (
              !response.razorpay_order_id ||
              !response.razorpay_payment_id ||
              !response.razorpay_signature
            ) {
              toast.error("Payment response incomplete");
              return;
            }

            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              studentId,
            });

            toast.success("Payment successful 🎉");
            fetchAvailableCourses(studentId);
          } catch (error) {
            console.error(error);
            toast.error(
              error.response?.data?.message || "Payment verification failed"
            );
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

      rzp.on("payment.failed", function () {
        toast.error("Payment failed");
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Enrollment failed");
    }
  };

  /////////////////////////////////////////////////////////////
  // LOADING UI
  /////////////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  /////////////////////////////////////////////////////////////
  // UI
  /////////////////////////////////////////////////////////////
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900">Available Classes</h1>

      {user?.role === "parent" && (
        <div className="bg-white p-4 rounded-xl shadow border w-80">
          <label className="text-sm font-bold text-slate-600">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedStudent(id);
              fetchAvailableCourses(id);
            }}
            className="mt-2 w-full border rounded-lg p-2"
          >
            {children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.studentNameEnglish || child.firstName} {/* Updated for your data */}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="flex flex-col overflow-hidden rounded-3xl bg-white shadow hover:shadow-xl border"
          >
            <div className="h-52 bg-slate-100">
              {course.thumbnail?.url ? (
                <img
                  src={course.thumbnail.url}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <BookOpen size={48} />
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{course.category}</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {course.duration} {course.durationUnit}s
                </span>
              </div>

              <h3 className="text-xl font-bold mt-2">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-2">
                {course.description.length > 100
                  ? `${course.description.slice(0, 100)}...`
                  : course.description}
              </p>

              <div className="mt-auto flex justify-between items-center pt-6">
                <div className="text-2xl font-black flex items-center">
                  {course.price === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <>
                      <IndianRupee size={18} />
                      {course.price}
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleEnroll(course)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
                >
                  <GraduationCap size={18} />
                  Enroll
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrollClass;