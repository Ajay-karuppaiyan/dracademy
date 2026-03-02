// ChildLeave.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Loader2, Search } from "lucide-react";

const ChildLeave = () => {
  const { user } = useAuth();
  const [leaveList, setLeaveList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // rows per page

  useEffect(() => {
    if (user.role === "parent") {
      fetchParentChildrenLeave();
    } else {
      fetchMyLeave();
    }
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [leaveList, searchTerm]);

  // ====================== PARENT ======================
  const fetchParentChildrenLeave = async () => {
    try {
      setLoading(true);
      const res = await api.get("/parent/children");
      const children = res.data;

      const allLeaves = [];

      for (const child of children) {
        const childRes = await api.get(
          `/parent/child/${child._id}/leave-request`
        );
        childRes.data.forEach((leave) => {
          allLeaves.push({
            childName: child.firstName,
            ...leave, // startDate, endDate, reason, status, etc.
          });
        });
      }

      setLeaveList(allLeaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ====================== STUDENT / EMPLOYEE ======================
  const fetchMyLeave = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leave/me"); // your existing endpoint
      setLeaveList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ====================== SEARCH ======================
  const handleSearch = (term) => {
    if (!term) {
      setFilteredList(leaveList);
      setCurrentPage(1);
      return;
    }

    const filtered = leaveList.filter(
      (leave) =>
        leave.childName?.toLowerCase().includes(term.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(term.toLowerCase()) ||
        (leave.startDate && leave.startDate.includes(term)) ||
        (leave.endDate && leave.endDate.includes(term))
    );

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  // ====================== PAGINATION ======================
  const totalPages = Math.ceil(filteredList.length / pageSize);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Leave Requests</h2>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2 w-full max-w-sm">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {paginatedList.length === 0 ? (
        <p className="text-gray-500">No leave requests found.</p>
      ) : (
        <div className="overflow-x-auto bg-white p-4 rounded-xl shadow-md">
          <table className="min-w-[900px] w-full text-sm text-center">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-2">S.No</th>
                {user.role === "parent" && <th className="p-2">Child</th>}
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-gray-50 transition ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-2 font-medium">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  {user.role === "parent" && (
                    <td className="p-2 font-medium">{item.childName}</td>
                  )}
                  <td className="p-2">{item.startDate?.slice(0, 10)}</td>
                  <td className="p-2">{item.endDate?.slice(0, 10)}</td>
                  <td className="p-2">{item.reason}</td>
                  <td
                    className={`p-2 font-semibold ${
                      item.status === "approved"
                        ? "text-green-600"
                        : item.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildLeave;