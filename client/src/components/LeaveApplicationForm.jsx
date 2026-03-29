import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const LeaveApplicationForm = ({ onSuccess, onCancel }) => {
  const today = new Date().toISOString().split("T")[0];

  const [employeeName, setEmployeeName] = useState(
    localStorage.getItem("name") || ""
  );
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [otherLeaveType, setOtherLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numDays, setNumDays] = useState(0);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("leave");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Calculate number of days
  useEffect(() => {
    if (mode === "leave" && startDate && endDate) {
      const diffTime =
        new Date(endDate).getTime() - new Date(startDate).getTime();
      const diffDays =
        Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNumDays(diffDays > 0 ? diffDays : 0);
    } else {
      setNumDays(0);
    }
  }, [startDate, endDate, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("id");
    if (!userId)
      return toast.error("User not found. Please login again.");

    // 🔴 Validation
    if (!employeeName || !reason)
      return toast.error("Fill all fields");

    if (mode === "leave") {
      if (!startDate || !endDate)
        return toast.error("Select leave dates");

      if (startDate < today)
        return toast.error("Start date cannot be in the past");

      if (endDate < startDate)
        return toast.error("End date must be after start date");
    }

    if (mode === "permission") {
      if (!startDate || !startTime || !endTime)
        return toast.error("Fill permission details");

      if (endTime <= startTime)
        return toast.error("End time must be after start time");
    }

    if (leaveType === "other" && !otherLeaveType.trim())
      return toast.error("Specify type");

    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("employeeName", employeeName);
    formData.append("mode", mode);
    formData.append(
      "leaveType",
      leaveType === "other" ? otherLeaveType : leaveType
    );
    formData.append("reason", reason);

    if (mode === "leave") {
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("numDays", numDays);
    }

    if (mode === "permission") {
      formData.append("permissionDate", startDate);
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
    }

    if (file) formData.append("file", file);

    try {
      setSubmitting(true);

      await api.post("/leave/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Request submitted successfully!");

      if (onSuccess) onSuccess();

      // Reset
      setReason("");
      setStartDate("");
      setEndDate("");
      setOtherLeaveType("");
      setLeaveType("casual");
      setFile(null);
      setStartTime("");
      setEndTime("");
      setNumDays(0);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit"
      );
    } finally {
      setSubmitting(false);
    }
  };

return (
  <div className="bg-white w-full">

    {/* HEADER */}
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        Leave / Permission Application
      </h2>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="p-4 space-y-6">

      {/* ===== BASIC ===== */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 border-b pb-1">
          Basic Details
        </h3>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              value={employeeName}
              readOnly
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Request Type
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="leave">Leave</option>
              <option value="permission">Permission</option>
            </select>
          </div>

        </div>
      </div>

      {/* ===== DETAILS ===== */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 border-b pb-1">
          {mode === "leave" ? "Leave Details" : "Permission Details"}
        </h3>

        {mode === "leave" && (
          <div className="grid md:grid-cols-2 gap-3">

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="vacation">Vacation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {leaveType === "other" && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Specify Leave Type
                </label>
                <input
                  type="text"
                  value={otherLeaveType}
                  onChange={(e) => setOtherLeaveType(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded-lg"
                min={today}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border p-2 rounded-lg"
                min={startDate || today}
              />
            </div>

            {numDays > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-700">
                  Total Days: <strong>{numDays}</strong>
                </p>
              </div>
            )}

          </div>
        )}

        {mode === "permission" && (
          <div className="grid md:grid-cols-2 gap-3">

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Permission Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Permission Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded-lg"
                min={today}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border p-2 rounded-lg"
              />
            </div>

          </div>
        )}
      </div>

      {/* ===== EXTRA ===== */}
      <div className="space-y-3">

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Attachment (optional)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

      </div>

      {/* ===== BUTTONS ===== */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className={`px-5 py-2 rounded-lg ${
            submitting
              ? "bg-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

    </form>
  </div>
);
};

export default LeaveApplicationForm;