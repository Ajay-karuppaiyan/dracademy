import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Attendance = () => {
  const { user, token } = useAuth(); // Make sure AuthContext provides JWT token
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

  const API_URL = import.meta.env.VITE_API_URL;

  // Start camera
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

  // Capture photo
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
      }
      setCameraActive(false);
    }
  };

  const handleRecapture = async () => {
    setPhoto(null);
    startCamera();
  };

  // Fetch attendance
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
      setCameraActive(false);
    }
  }, [showForm]);

  // Submit attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const loginTime = new Date().toLocaleTimeString();

      const res = await api.post(
        `${API_URL}/attendance`,
        { name: user.name, role: user.role, date, loginTime, photo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendanceList([res.data, ...attendanceList]);
      videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
      setPhoto(null);
      setCameraActive(false);
      setShowForm(false);
    } catch (err) {
      if (err.response?.status === 400) alert(err.response.data.message);
      else console.error(err);
    }
    setLoading(false);
  };

  // Set logout time
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

  const filteredAttendance =
    user.role === "admin"
      ? attendanceList.filter(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      : attendanceList.filter(a => a.name === user.name);

  // Stats
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
    const total = new Date(year, month + 1, 0).getDate();
    stats = { present, total };
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Attendance</h1>
            <p className="text-sm text-slate-500">Manage daily login/logout</p>
          </div>
          {user.role !== "admin" && !showForm && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md">+ Mark Attendance</button>
          )}
        </div>

        {/* FORM */}
        {user.role !== "admin" && showForm && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center shadow-sm">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                ) : photo ? (
                  <img src={photo} alt="Attendance" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm opacity-60">Starting camera...</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                {cameraActive && <button type="button" onClick={handleCapture} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow">Capture</button>}
                {photo && (
                  <>
                    <button type="button" onClick={handleRecapture} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-xl">Retake</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl">{loading ? "Submitting..." : "Submit"}</button>
                  </>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </form>
          </div>
        )}

        {/* TABLE */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 overflow-x-auto">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border px-3 py-2 rounded-xl w-full sm:w-1/3 mb-4" />

            {user.role !== "admin" && stats && (
              <div className="flex gap-4 text-sm font-semibold bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 mb-4">
                <span>Present: <span className="text-green-600">{stats.present}</span></span>
                <span>Total Days: <span className="text-indigo-600">{stats.total}</span></span>
              </div>
            )}

            <table className="w-full border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b">
                  <th className="py-2 text-left">S.no</th>
                  <th className="py-2 text-left">Employee</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Login</th>
                  <th className="py-2 text-left">Logout</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400">No attendance records</td></tr>
                ) : filteredAttendance.map((a, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="py-2">{idx + 1}</td>
                    <td className="py-2">{a.name}</td>
                    <td className="py-2">{a.date}</td>
                    <td className="py-2">{formatTime12Hour(a.loginTime)}</td>
                    <td className="py-2">{formatTime12Hour(a.logoutTime)}</td>
                    <td className="py-2 flex justify-center gap-2">
                      <button onClick={() => setViewModal(a)} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs hover:bg-blue-200">View</button>
                      {user.role !== "admin" && a.date === todayDate && (
                        <button disabled={!!a.logoutTime} onClick={() => handleSetLogout(a)}
                          className={`px-2 py-1 rounded-lg text-xs ${a.logoutTime ? "bg-gray-200 text-gray-400" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                          {a.logoutTime ? "Logged Out" : "Logout"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL */}
        {viewModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setViewModal(null)}>
            <div className="bg-white w-[420px] p-6 rounded-2xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewModal(null)} className="absolute top-3 right-4 text-slate-400 hover:text-slate-700">✕</button>
              <h3 className="text-xl font-semibold mb-4">Attendance Details</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p><strong>Name:</strong> {viewModal.name}</p>
                <p><strong>Role:</strong> {viewModal.role}</p>
                <p><strong>Date:</strong> {viewModal.date}</p>
                <p><strong>Login:</strong> {formatTime12Hour(viewModal.loginTime)}</p>
                <p><strong>Logout:</strong> {formatTime12Hour(viewModal.logoutTime)}</p>
              </div>
              {viewModal.photo && <img src={viewModal.photo} alt="Attendance" className="w-32 h-32 rounded-xl mt-4 object-cover border shadow-sm mx-auto" />}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Attendance;