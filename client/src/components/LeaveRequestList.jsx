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
  <div className="min-h-screen bg-slate-50 p-6">
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Leave Requests
          </h1>
          <p className="text-sm text-slate-500">
            Manage employee leave applications
          </p>
        </div>

        {showApplyButton && user && user.role !== "admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          >
            + Apply Leave
          </button>
        )}
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <input
          type="text"
          placeholder="Search by employee, leave type or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* ===== TABLE CARD ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        {(onlyMine && user && user.role !== "admin"
          ? filteredRequests.filter(req => req.userId === user._id)
          : filteredRequests
        ).length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No leave requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">S.No</th>
                  <th className="px-6 py-4 text-left">Employee</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Reason</th>
                  <th className="px-6 py-4 text-left">Dates</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {(onlyMine && user && user.role !== "admin"
                  ? filteredRequests.filter(req => req.userId === user._id)
                  : filteredRequests
                ).map((req, index) => (
                  <tr
                    key={req._id}
                    className="border-t hover:bg-slate-50 transition"
                  >

                    <td className="px-6 py-4 text-slate-600">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {req.employeeName || "Unknown"}
                    </td>

                    <td className="px-6 py-4">{req.leaveType}</td>

                    <td className="px-6 py-4 text-slate-600">
                      {req.reason}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {new Date(req.startDate).toLocaleDateString()} -{" "}
                      {new Date(req.endDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      {user?.role === "admin" ? (
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(req._id, e.target.value)
                          }
                          className="border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : req.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button
                        onClick={() => fetchLeaveDetails(req._id)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Eye size={18} />
                      </button>

                      {(user?.role === "admin" ||
                        (req.userId === user?._id &&
                          req.status === "pending")) && (
                        <button
                          onClick={() => handleDelete(req._id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* ===== APPLY LEAVE MODAL ===== */}
    {showApplyButton && showForm && user && user.role !== "admin" && (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setShowForm(false)}
      >
        <div
          className="bg-white w-[500px] p-6 rounded-2xl shadow-xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Apply for Leave
          </h2>

          <LeaveApplicationForm
            onSuccess={() => {
              fetchRequests(user.role);
              setShowForm(false);
            }}
          />

          <button
            onClick={() => setShowForm(false)}
            className="absolute top-3 right-4 text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      </div>
    )}

    {/* ===== DETAILS MODAL ===== */}
    {selectedLeave && (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setSelectedLeave(null)}
      >
        <div
          className="bg-white w-[500px] p-6 rounded-2xl shadow-xl relative space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-3">
            Leave Details
          </h2>

          {loadingDetails ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Employee:</strong> {selectedLeave.employeeName}</p>
              <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              <p><strong>Start:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    selectedLeave.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : selectedLeave.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedLeave.status}
                </span>
              </p>

              {selectedLeave.fileUrl && (
                <a
                  href={`http://localhost:5000/${selectedLeave.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  View Attachment
                </a>
              )}
            </div>
          )}

          <button
            onClick={() => setSelectedLeave(null)}
            className="absolute top-3 right-4 text-slate-400 hover:text-slate-700"
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
