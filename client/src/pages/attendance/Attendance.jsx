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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>

      {/* ===== ADD ATTENDANCE BUTTON ===== */}
      {user?.role !== "admin" && !showForm && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ➕ Add Attendance
          </button>
        </div>
      )}

      {/* ===== ATTENDANCE FORM ===== */}
      {user?.role !== "admin" && showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 max-w-md mx-auto flex flex-col items-center"
        >

          {/* CAMERA / PHOTO CONTAINER */}
          <div className="flex flex-col items-center gap-4 mb-4">

            {/* Fixed Size Camera Frame */}
            <div className="w-[420px] h-[320px] rounded-xl border border-gray-300 overflow-hidden bg-black flex items-center justify-center">

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

            </div>

            {/* Buttons */}
            {cameraActive && (
              <button
                type="button"
                onClick={handleCapture}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Capture Photo
              </button>
            )}

            {photo && (
              <div className="flex gap-4 justify-center mt-2">
                <button
                  type="button"
                  onClick={handleRecapture}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Recapture
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </form>
      )}

      {!showForm && (
        <>
          {/* ===== FILTER BAR & STATS ===== */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border px-4 py-2 rounded w-full md:w-1/3"
            />
            {user?.role !== "admin" && stats && (
              <div className="flex gap-4 text-sm font-semibold">
                <span>
                  Present: <span className="text-green-600">{stats.present}</span>
                </span>
                <span>
                  Total: <span className="text-blue-600">{stats.total}</span>
                </span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">Attendance Records</h3>

          <table className="w-full border-collapse border border-slate-300 text-center">
            <thead>
              <tr className="bg-slate-50">
                <th className="border px-4 py-2 text-center">S.No</th>
                <th className="border px-4 py-2 text-center">Employee</th>
                <th className="border px-4 py-2 text-center">Date</th>
                <th className="border px-4 py-2 text-center">Login Time</th>
                <th className="border px-4 py-2 text-center">Logout Time</th>
                <th className="border px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((a, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2 text-center">{idx + 1}</td>
                    <td className="border px-4 py-2 text-center">{a.name}</td>
                    <td className="border px-4 py-2 text-center">{a.date}</td>
                    <td className="border px-4 py-2 text-center">
                      {formatTime12Hour(a.loginTime)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {formatTime12Hour(a.logoutTime)}
                    </td>
                    <td className="border px-4 py-2 flex gap-2 justify-center">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        onClick={() => setViewModal(a)}
                      >
                        View
                      </button>

                      {user?.role !== "admin" &&
                        a.date === todayDate && (
                          <button
                            disabled={!!a.logoutTime}
                            onClick={() => handleSetLogout(idx)}
                            className={`px-2 py-1 rounded text-xs text-white transition
                            ${a.logoutTime
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-800"
                              }`}
                          >
                            {a.logoutTime ? "Logged Out" : "Set Logout"}
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* ===== VIEW MODAL ===== */}
      {viewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" onClick={() => setViewModal(null)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Attendance Details</h2>
            <p><strong>Name:</strong> {viewModal.name}</p>
            <p><strong>Role:</strong> {viewModal.role}</p>
            <p><strong>Date:</strong> {viewModal.date}</p>
            <p><strong>Login Time:</strong> {formatTime12Hour(viewModal.loginTime)}</p>
            <p><strong>Logout Time:</strong> {formatTime12Hour(viewModal.logoutTime)}</p>
            {viewModal.photo && (
              <div className="mt-2"><img src={viewModal.photo} alt="Attendance" className="w-32 h-32 object-cover rounded" /></div>
            )}
            <button onClick={() => setViewModal(null)} className="absolute top-2 right-3 text-gray-600 hover:text-black">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;