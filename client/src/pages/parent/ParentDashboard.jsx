import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Loader2,
  User,
  BookOpen,
  Clock,
  CreditCard,
  Award,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [overview, setOverview] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState("");

  const { logout } = useAuth();

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchOverview(selectedChild._id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const res = await api.get("/parent/children");
      setChildren(res.data);
      if (res.data.length > 0) {
        setSelectedChild(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async (studentId) => {
    setLoading(true);
    try {
      const res = await api.get(`/parent/child/${studentId}/overview`);
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceList = async (studentId) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/parent/child/${studentId}/attendance?month=${selectedMonth}`
      );
      setAttendanceList(res.data);
      setView("attendance");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Loading Screen
  if (loading && !children.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // No Children Linked
  if (!loading && children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-700 mb-2">
          No students linked to this account
        </h2>
        <a
          href="/dashboard/parent/register-child"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg mt-4"
        >
          Register Child
        </a>
        <button
          onClick={logout}
          className="text-red-500 underline mt-4 text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Parent Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Monitor your child's progress
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Child Selector - Scrollable on mobile */}
      <div className="flex overflow-x-auto gap-2 p-3 bg-white shadow-sm">
        {children.map((child) => (
          <button
            key={child._id}
            onClick={() => setSelectedChild(child)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm ${
              selectedChild?._id === child._id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {child.firstName}
          </button>
        ))}

        <a
          href="/dashboard/parent/register-child"
          className="whitespace-nowrap px-4 py-2 rounded-full text-sm bg-green-600 text-white"
        >
          + Add
        </a>
      </div>

      <div className="p-4">
        {/* Attendance View */}
        {view === "attendance" ? (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Attendance Records</h3>
              <button
                onClick={() => setView("dashboard")}
                className="text-blue-600 text-sm underline"
              >
                Back
              </button>
            </div>

            {attendanceList.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                    <tr>
                    <th className="p-2 text-left">S.No</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Day</th>
                    <th className="p-2 text-left">Login</th>
                    <th className="p-2 text-left">Logout</th>
                    <th className="p-2 text-left">Hours</th>
                    <th className="p-2 text-left">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {attendanceList.map((item, index) => (
                    <tr
                        key={index}
                        className="border-b hover:bg-gray-50 transition"
                    >
                        <td className="p-2 font-medium">{item.sNo}</td>

                        <td className="p-2">{item.date}</td>

                        <td className="p-2 text-gray-600">{item.day}</td>

                        <td className="p-2">{item.loginTime}</td>

                        <td className="p-2">{item.logoutTime}</td>

                        <td className="p-2 font-medium text-blue-600">
                        {item.totalHours}
                        </td>

                        <td
                        className={`p-2 font-semibold ${
                            item.status === "Present"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                        >
                        {item.status}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            ) : (
            <p className="text-gray-500 text-sm">
                No attendance records found.
            </p>
            )}
          </div>
        ) : (
          overview && (
            <div className="space-y-4">
              {/* Profile */}
              <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={28} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    {overview.student.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Class: {overview.student.class}
                  </p>
                </div>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Attendance Card */}
                <div
                  onClick={() =>
                    fetchAttendanceList(selectedChild._id)
                  }
                  className="bg-white p-4 rounded-xl shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Clock size={18} />
                    <span className="font-semibold text-sm">
                      Attendance
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {overview.attendance.percentage}%
                  </div>
                </div>

                {/* Fees Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CreditCard size={18} />
                    <span className="font-semibold text-sm">
                      Fees Due
                    </span>
                  </div>
                  <div className="text-xl font-bold">
                    ₹ {overview.fees.pending}
                  </div>
                </div>

                {/* Grades */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-600 mb-3">
                    <BookOpen size={18} />
                    <span className="font-semibold text-sm">
                      Performance
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {overview.grades.map((g, i) => (
                      <div
                        key={i}
                        className="bg-indigo-50 p-2 rounded text-center"
                      >
                        <div className="text-xs text-gray-500">
                          {g.subject}
                        </div>
                        <div className="font-bold text-indigo-700">
                          {g.grade}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-yellow-600 mb-2">
                    <Award size={18} />
                    <span className="font-semibold text-sm">
                      Achievements
                    </span>
                  </div>

                  {overview.certificates.length > 0 ? (
                    overview.certificates.map((cert, i) => (
                      <div
                        key={i}
                        className="text-sm border-b py-2"
                      >
                        {cert.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">
                      No achievements yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;