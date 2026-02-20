import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const LeaveApplicationForm = ({ onSuccess }) => {
  const today = new Date().toISOString().split("T")[0];
  const [employeeName, setEmployeeName] = useState(localStorage.getItem("name") || "");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [otherLeaveType, setOtherLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numDays, setNumDays] = useState(0);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNumDays(diffDays > 0 ? diffDays : 0);
    } else setNumDays(0);
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("id"); // logged-in user's Mongo ID
    if (!userId) return toast.error("User not found. Please login again.");

    if (!employeeName || !reason || !startDate || !endDate) return toast.error("Fill all fields");
    if (startDate < today) return toast.error("Start date cannot be in the past");
    if (endDate < startDate) return toast.error("End date must be after start date");
    if (leaveType === "other" && !otherLeaveType.trim()) return toast.error("Specify other leave type");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("employeeName", employeeName);
    formData.append("leaveType", leaveType === "other" ? otherLeaveType : leaveType);
    formData.append("reason", reason);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("numDays", numDays);
    if (file) formData.append("file", file);

    try {
      setSubmitting(true);
      await api.post("/leave/apply", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Leave applied successfully!");
      if (onSuccess) {
        onSuccess();
      }
      setReason(""); setStartDate(""); setEndDate(""); setOtherLeaveType(""); setLeaveType("casual"); setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply leave");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-200">
      <div>
        <label>Employee Name</label>
        <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="w-full border p-2 rounded" required />
      </div>

      <div>
        <label>Leave Type</label>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full border p-2 rounded">
          <option value="casual">Casual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="vacation">Vacation</option>
          <option value="other">Other</option>
        </select>
      </div>

      {leaveType === "other" && (
        <div>
          <label>Specify Leave Type</label>
          <input type="text" value={otherLeaveType} onChange={(e) => setOtherLeaveType(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
      )}

      <div>
        <label>Reason</label>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border p-2 rounded" required />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border p-2 rounded" min={today} required />
        </div>
        <div className="flex-1">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border p-2 rounded" min={startDate || today} required />
        </div>
      </div>

      {numDays > 0 && <p>Number of days: <strong>{numDays}</strong></p>}

      <div>
        <label>Upload Document (optional)</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className={`px-4 py-1 rounded ${submitting ? "bg-gray-400" : "bg-blue-600 text-white"}`}>
          {submitting ? "Applying..." : "Apply Leave"}
        </button>
      </div>
    </form>
  );
};

export default LeaveApplicationForm;