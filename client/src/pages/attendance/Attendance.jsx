import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Payroll from "../../pages/payroll/Payroll";

const Attendance = () => {
  const { user, token } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const todayDate = new Date().toISOString().slice(0, 10);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [activeTab, setActiveTab] = useState("attendance");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const API_URL = import.meta.env.VITE_API_URL;

  const startCamera = async () => {
    setCameraActive(true);
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch {
        alert("Camera access denied or not available.");
      }
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL("image/png"));
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      setCameraActive(false);
    }
  };

  const handleRecapture = async () => {
    setPhoto(null);
    startCamera();
  };

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      const params = user.role === "admin" ? {} : { name: user.name };
      const res = await api.get(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setAttendanceList(res.data);
    } catch {
      setAttendanceList([]);
    }
  };

  useEffect(() => { fetchAttendance(); }, [user]);
  useEffect(() => { if (showForm) startCamera(); }, [showForm]);

  useEffect(() => {
    if (!showForm && videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null; 
      setCameraActive(false);
    }
  }, [showForm]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const loginTime = new Date().toTimeString().slice(0, 8);

    const res = await api.post(
      `${API_URL}/attendance`,
      { loginTime, photo }, // ✅ only send required fields
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAttendanceList([res.data, ...attendanceList]);

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setPhoto(null);
    setCameraActive(false);
    setShowForm(false);

  } catch (err) {
    console.error("Attendance submit error:", err.response?.data || err.message);
  }

  setLoading(false);
};

  const handleSetLogout = async (record) => {
    try {
      const logoutTime = new Date().toLocaleTimeString();
      await api.patch(
        `${API_URL}/attendance/logout/${record._id}`,
        { logoutTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceList(prev =>
        prev.map(a => (a._id === record._id ? { ...a, logoutTime } : a))
      );
    } catch {}
  };

  const formatTime12Hour = (time) => {
    if (!time) return "-";
    const d = new Date(`1970-01-01T${time}`);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // FILTERED ATTENDANCE
  const filteredAttendance = useMemo(() => {
    return attendanceList
      .filter(a => {
        // SEARCH: match name or role
        const matchSearch = searchTerm
          ? a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.role?.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        // DATE FILTER
        const matchFrom = filterFrom ? new Date(a.date) >= new Date(filterFrom) : true;
        const matchTo = filterTo ? new Date(a.date) <= new Date(filterTo) : true;

        // NON-ADMIN: show only self
        const matchUser = user.role !== "admin" ? a.name === user.name : true;

        return matchSearch && matchFrom && matchTo && matchUser;
      });
  }, [attendanceList, searchTerm, filterFrom, filterTo, user]);

  // PAGINATION
  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredAttendance.slice(indexOfFirst, indexOfLast);

  // STATS (kept same)
  let stats = null;
  if (filteredAttendance.length > 0) {
    const person = filteredAttendance[0].name;
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();
    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
    const todayDate = isCurrentMonth ? today.getDate() : new Date(year, month + 1, 0).getDate();
    const personMonthRecords = attendanceList.filter(
      (a) =>
        a.name === person &&
        new Date(a.date).getMonth() === month &&
        new Date(a.date).getFullYear() === year
    );
    const present = personMonthRecords.length;

    let workingDaysTillToday = 0;
    for (let day = 1; day <= todayDate; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0) workingDaysTillToday++;
    }

    let totalWorkingDays = 0;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0) totalWorkingDays++;
    }

    const absent = workingDaysTillToday - present;

    stats = { present, absent, total: totalWorkingDays };
  }

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);


  const hasMarkedToday = attendanceList.some(
    (a) => new Date(a.date).toISOString().slice(0, 10) === todayDate
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

{/* Tabs */}
{user?.role === "admin" && (
<div className="border-b border-slate-200 mb-4">
  <div className="flex gap-6">
    {["attendance", "payroll"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
          activeTab === tab
            ? "border-indigo-600 text-indigo-700"
            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
        }`}
      >
        {tab.replace("_", " ")}
      </button>
    ))}
  </div>
</div>
)}

{/* Tab Content */}
<div className="animate-in fade-in duration-300">
  {activeTab === "attendance" && (
    <>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Attendance</h1>
            <p className="text-sm  pb-4 text-slate-500">Manage daily login/logout</p>
          </div>

          {user.role !== "admin" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={hasMarkedToday}
              className={`bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-2.5 rounded-xl shadow-md w-full md:w-auto ${
                hasMarkedToday ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {hasMarkedToday ? "Already Marked" : "+ Mark Attendance"}
            </button>
          )}
        </div>

        {/* FORM */}
        {user.role !== "admin" && showForm && (
          <div className="bg-white rounded-2xl shadow-lg border p-6 w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
              <div className="w-full aspect-video rounded-2xl overflow-hidden border bg-black flex items-center justify-center shadow">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                ) : photo ? (
                  <img src={photo} alt="Attendance" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm opacity-60">Starting camera...</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {cameraActive && (
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl shadow"
                  >
                    Capture
                  </button>
                )}

                {photo && (
                  <>
                    <button
                      type="button"
                      onClick={handleRecapture}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
                    >
                      Retake
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow"
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </form>
          </div>
        )}
        
        {/* Filter */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-6 gap-4">
          <div className="flex flex-col w-full md:w-1/3">
            <input
              id="search"
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <label htmlFor="filterFrom" className="text-sm pl-2 font-semibold text-slate-700 mb-1">
                Start Date : 
              </label>
              <input
                id="filterFrom"
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="border border-slate-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="filterTo" className="text-sm pl-2 font-semibold text-slate-700 mb-1">
                End Date : 
              </label>
              <input
                id="filterTo"
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="border border-slate-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 text-left">S.no</th>
              <th className="py-3 px-4 text-left">Employee</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Login</th>
              <th className="py-3 px-4 text-left">Logout</th>
              <th>Hours</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                currentRecords.map((a, idx) => {
                  // Calculate working hours dynamically
                  const calculateWorkingHours = (loginTime, logoutTime) => {
                    if (!loginTime || !logoutTime) return "-";
                    const start = new Date(`1970-01-01T${loginTime}`);
                    const end = new Date(`1970-01-01T${logoutTime}`);
                    const diffMs = end - start;
                    if (diffMs < 0) return "-";
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}h ${minutes}m`;
                  };

                  return (
                    <tr key={a._id || idx} className="border-b hover:bg-indigo-50 transition">
                      <td className="py-3 px-4">{indexOfFirst + idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{a.name}</td>
                      <td className="py-3 px-4">{new Date(a.date).toISOString().slice(0, 10)}</td>
                      <td className="py-3 px-4">{formatTime12Hour(a.loginTime)}</td>
                      <td className="py-3 px-4">{formatTime12Hour(a.logoutTime)}</td>
                      <td className="py-3 px-4">{calculateWorkingHours(a.loginTime, a.logoutTime)}</td>
                      <td className="py-3 px-4 flex justify-center gap-2">
                        <button
                          onClick={() => setViewModal(a)}
                          className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-indigo-600 transition"
                        >
                          View
                        </button>
                        {user.role !== "admin" &&
                          new Date(a.date).toISOString().slice(0, 10) === todayDate && (
                            <button
                              disabled={!!a.logoutTime}
                              onClick={() => handleSetLogout(a)}
                              className={`px-3 py-1 rounded-lg text-xs transition ${
                                a.logoutTime
                                  ? "bg-gray-300 text-gray-500"
                                  : "bg-green-500 text-white hover:bg-green-600"
                              }`}
                            >
                              {a.logoutTime ? "Logged Out" : "Logout"}
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="relative flex items-center mt-4 px-4">
            {/* Previous Button */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="absolute left-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300"
            >
              Previous
            </button>

            {/* Page Info Centered */}
            <span className="mx-auto text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next Button */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="absolute right-0 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
    </>
  )}

  {activeTab === "payroll" && <Payroll />}
</div>


    
        {/* MODAL */}
        {viewModal && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewModal(null)}
          >
            <div
              className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setViewModal(null)}
                className="absolute top-3 right-4 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold mb-4 text-center">
                Attendance Details
              </h3>

              <div className="space-y-3 text-sm text-slate-600">
                <p><strong>Name:</strong> {viewModal.name}</p>
                <p><strong>Role:</strong> {viewModal.role}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(viewModal.date).toISOString().slice(0, 10)}
                </p>
                <p><strong>Login:</strong> {formatTime12Hour(viewModal.loginTime)}</p>
                <p><strong>Logout:</strong> {formatTime12Hour(viewModal.logoutTime)}</p>
              </div>

              {viewModal.photo && (
                <img
                  src={viewModal.photo}
                  alt="Attendance"
                  className="w-32 h-32 rounded-xl mt-5 object-cover border shadow-sm mx-auto"
                />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Attendance;