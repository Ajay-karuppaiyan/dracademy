import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Attendance = () => {
  const { user } = useAuth();
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

  // Start camera
  const startCamera = async () => {
    setCameraActive(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Camera access denied or not available.");
      }
    }
  };

  // Capture photo from camera
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setPhoto(dataUrl);
      // Stop camera
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    }
  };

  // Recapture photo
  const handleRecapture = async () => {
    setPhoto(null);
    setCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or not available.");
    }
  };

  // Fetch attendance from DB
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        let params = {};
        if (user?.role !== "admin" && user?.role !== "employee") {
          params = { name: user?.name };
        }
        const res = await api.get("/attendance", { params });
        setAttendanceList(res.data);
      } catch (err) {
        setAttendanceList([]);
      }
    };
    if (user) fetchAttendance();
  }, [user]);

  useEffect(() => {
    if (showForm) {
      startCamera();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm && videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  }, [showForm]);

  // Submit attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const today = new Date();
      const date = today.toISOString().slice(0, 10);
      const loginTime = today.toLocaleTimeString();

      const res = await api.post("/attendance", {
        name: user?.name,
        role: user?.role,
        date,
        loginTime,
        photo,
      });

      setAttendanceList([res.data, ...attendanceList]);

      // STOP CAMERA COMPLETELY
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      setCameraActive(false);
      setPhoto(null);
      setShowForm(false);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // Set logout time in DB
  const handleSetLogout = async (idx) => {
    try {
      const record = filteredAttendance[idx];
      const logoutTime = new Date().toLocaleTimeString();
      const res = await api.patch(`/attendance/logout/${record._id}`, { logoutTime });
      setAttendanceList((prev) =>
        prev.map((a) => (a._id === record._id ? { ...a, logoutTime } : a))
      );
    } catch (err) { }
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return "-";

    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filtered attendance by search
  const filteredAttendance =
    user?.role === "admin"
      ? attendanceList.filter((a) =>
        a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : attendanceList.filter((a) => a.name === user?.name);

  // Dynamic attendance stats for filtered person (current month)
  let stats = null;
  if (filteredAttendance.length > 0) {
    const person = filteredAttendance[0].name;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const personMonthRecords = attendanceList.filter(
      (a) =>
        a.name === person &&
        new Date(a.date).getMonth() === month &&
        new Date(a.date).getFullYear() === year
    );
    const present = personMonthRecords.length;
    // For dynamic absent count, you would need a list of working days
    // Here, we just show present and total for the month
    const total = new Date(year, month + 1, 0).getDate();
    stats = { present, total };
  }

 return (
  <div className="min-h-screen bg-slate-50 p-6">
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Attendance</h1>
          <p className="text-sm text-slate-500">
            Manage daily login and logout records
          </p>
        </div>

        {user?.role !== "admin" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all duration-200"
          >
            + Mark Attendance
          </button>
        )}
      </div>

      {/* ===== FORM CARD ===== */}
      {user?.role !== "admin" && showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6"
          >

            {/* Camera Container */}
            <div className="w-[420px] h-[320px] rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center shadow-sm">

              {cameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )}

              {photo && !cameraActive && (
                <img
                  src={photo}
                  alt="Attendance"
                  className="w-full h-full object-cover"
                />
              )}

              {!cameraActive && !photo && (
                <span className="text-white text-sm opacity-60">
                  Starting camera...
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              {cameraActive && (
                <button
                  type="button"
                  onClick={handleCapture}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow transition"
                >
                  Capture
                </button>
              )}

              {photo && (
                <>
                  <button
                    type="button"
                    onClick={handleRecapture}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition"
                  >
                    Retake
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition"
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

      {/* ===== TABLE SECTION ===== */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">

          {/* Search & Stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 px-4 py-2.5 rounded-xl w-full md:w-1/3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            {user?.role !== "admin" && stats && (
              <div className="flex gap-6 text-sm font-semibold bg-indigo-50 px-5 py-2 rounded-xl border border-indigo-100">
                <span>
                  Present: <span className="text-green-600">{stats.present}</span>
                </span>
                <span>
                  Total Days: <span className="text-indigo-600">{stats.total}</span>
                </span>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b">
                  <th className="py-3 text-left">S.no</th>
                  <th className="py-3 text-left">Employee</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Login</th>
                  <th className="py-3 text-left">Logout</th>
                  <th className="py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance records available
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((a, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-slate-50 transition"
                    >
                      <td className="py-3">{idx + 1}</td>
                      <td className="py-3 font-medium">{a.name}</td>
                      <td className="py-3">{a.date}</td>
                      <td className="py-3">
                        {formatTime12Hour(a.loginTime)}
                      </td>
                      <td className="py-3">
                        {formatTime12Hour(a.logoutTime)}
                      </td>

                      <td className="py-3 flex justify-center gap-2">
                        <button
                          onClick={() => setViewModal(a)}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs hover:bg-blue-200 transition"
                        >
                          View
                        </button>

                        {user?.role !== "admin" &&
                          a.date === todayDate && (
                            <button
                              disabled={!!a.logoutTime}
                              onClick={() => handleSetLogout(idx)}
                              className={`px-3 py-1 rounded-lg text-xs transition
                                ${
                                  a.logoutTime
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                            >
                              {a.logoutTime ? "Logged Out" : "Logout"}
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {viewModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setViewModal(null)}
        >
          <div
            className="bg-white w-[420px] p-6 rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewModal(null)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Attendance Details
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <p><strong>Name:</strong> {viewModal.name}</p>
              <p><strong>Role:</strong> {viewModal.role}</p>
              <p><strong>Date:</strong> {viewModal.date}</p>
              <p><strong>Login:</strong> {formatTime12Hour(viewModal.loginTime)}</p>
              <p><strong>Logout:</strong> {formatTime12Hour(viewModal.logoutTime)}</p>
            </div>

            {viewModal.photo && (
              <div className="mt-5 flex justify-center">
                <img
                  src={viewModal.photo}
                  alt="Attendance"
                  className="w-32 h-32 rounded-xl object-cover border shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Attendance;