import React, { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Eye, Trash2 } from "lucide-react";
import LeaveApplicationForm from "./LeaveApplicationForm";

const LeaveRequestList = ({ showApplyButton = true, onlyMine = false }) => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);

  // ================= FETCH LOGGED IN USER =================
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user info");
    }
  };

  // ================= FETCH LEAVE LIST =================
  const fetchRequests = async (role) => {
    try {
      const url = role === "admin" ? "/leave/all" : "/leave";
      const res = await api.get(url);
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leave requests");
    }
  };

  // ================= FETCH SINGLE LEAVE DETAILS =================
  const fetchLeaveDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/leave/${id}`);
      setSelectedLeave(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leave details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // ================= UPDATE STATUS =================
  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/leave/${id}/status`, { status });
      toast.success(`Leave status updated to ${status}`);

      // Refresh table for employee/admin
      fetchRequests(user.role);

      // Refresh modal if it's open
      if (selectedLeave && selectedLeave._id === id) {
        fetchLeaveDetails(id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update leave status");
    }
  };

  // ================= DELETE LEAVE =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/leave/${id}`);
      toast.success("Leave deleted successfully");
      fetchRequests(user.role);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete leave");
    }
  };

  // ================= USE EFFECTS =================
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRequests(user.role);
    }
  }, [user]);

  // ================= SEARCH FILTER =================
  useEffect(() => {
    const filtered = requests.filter((req) =>
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // ================= STATUS COLOR HELPER =================
  const getStatusClass = (status) => {
    if (status === "approved") return "text-green-600 font-semibold";
    if (status === "rejected") return "text-red-600 font-semibold";
    return "text-yellow-600 font-semibold"; // pending
  };

  // ================= RENDER =================
  return (
    <div className="overflow-x-auto p-4">
      {/* ===== HEADER & BUTTON ===== */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by employee, type or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 w-full md:w-1/2 rounded"
        />
        {showApplyButton && user && user.role !== "admin" && (
          <button
            className="ml-4 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition"
            onClick={() => setShowForm(true)}
          >
            Add Leave
          </button>
        )}
      </div>

      {/* ===== LEAVE FORM MODAL ===== */}
      {showApplyButton && showForm && user && user.role !== "admin" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Apply for Leave</h2>
            <LeaveApplicationForm
              onSuccess={() => {
                fetchRequests(user.role);
                setShowForm(false);
              }}
            />
            <button onClick={() => setShowForm(false)} className="absolute top-2 right-3 text-gray-600 hover:text-black">✕</button>
          </div>
        </div>
      )}

      {/* ===== LEAVE REQUEST TABLE ===== */}
      {(onlyMine && user && user.role !== "admin"
        ? filteredRequests.filter(req => req.userId === user._id)
        : filteredRequests
      ).length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50">
              <th className="border px-4 py-2">Employee</th>
              <th className="border px-4 py-2">Leave Type</th>
              <th className="border px-4 py-2">Reason</th>
              <th className="border px-4 py-2">Dates</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {(onlyMine && user && user.role !== "admin"
              ? filteredRequests.filter(req => req.userId === user._id)
              : filteredRequests
            ).map((req) => (
              <tr key={req._id} className="text-center">
                <td className="border px-4 py-2">{req.employeeName || "Unknown"}</td>
                <td className="border px-4 py-2">{req.leaveType}</td>
                <td className="border px-4 py-2">{req.reason}</td>
                <td className="border px-4 py-2">
                  {new Date(req.startDate).toLocaleDateString()} -{" "}
                  {new Date(req.endDate).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  {user?.role === "admin" ? (
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <span className={getStatusClass(req.status)}>{req.status}</span>
                  )}
                </td>
                <td className="border px-4 py-2 flex justify-center gap-2">
                  {/* VIEW BUTTON */}
                  <button
                    onClick={() => fetchLeaveDetails(req._id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Eye size={18} />
                  </button>
                  {/* DELETE BUTTON */}
                  {(user?.role === "admin" ||
                    (req.userId === user?._id && req.status === "pending")) && (
                    <button
                      onClick={() => handleDelete(req._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= MODAL ================= */}
      {selectedLeave && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          onClick={() => setSelectedLeave(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Leave Details</h2>

            {loadingDetails ? (
              <p>Loading...</p>
            ) : (
              <>
                <p><strong>Employee Name:</strong> {selectedLeave.employeeName}</p>
                <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                <p><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusClass(selectedLeave.status)}>
                    {selectedLeave.status}
                  </span>
                </p>

                {selectedLeave.fileUrl && (
                  <p className="mt-2">
                    <strong>Attachment:</strong>{" "}
                    <a
                      href={`http://localhost:5000/${selectedLeave.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View File
                    </a>
                  </p>
                )}
              </>
            )}

            <button
              onClick={() => setSelectedLeave(null)}
              className="absolute top-2 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestList;
