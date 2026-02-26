import React, { useEffect, useState } from "react";
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  DollarSign,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import AddExpenseModal from "./addExpenseModel";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // TODO: Replace this with real user info from context/auth
  const user = JSON.parse(localStorage.getItem("user")) || { role: "employee" }; 

  /* ================= FETCH EXPENSES ================= */
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/expenses/${id}/status`, { status });
      toast.success(res.data?.message || `Expense ${status}`);
      fetchExpenses();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ================= DELETE EXPENSE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await api.delete(`/expenses/${id}`);
      toast.success(res.data?.message || "Expense deleted");
      fetchExpenses();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /* ================= SAFE STATS CALC ================= */
  const totalAmount = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingCount = (expenses || []).filter((e) => e.status === "pending").length;
  const approvedAmount = (expenses || [])
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expense Management</h2>
          <p className="text-sm text-slate-500">
            Track and manage employee expense claims.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700"
        >
          <Plus size={16} /> Add Expense
        </button>

        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={fetchExpenses}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Expenses" value={`₹ ${totalAmount}`} icon={DollarSign} color="blue" />
        <StatCard label="Pending Approval" value={pendingCount} icon={Clock} color="orange" />
        <StatCard label="Approved Amount" value={`₹ ${approvedAmount}`} icon={CheckCircle} color="green" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 text-left">S.No</th>
              <th className="px-6 py-4 text-left">Employee</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-slate-400">
                  Loading expenses...
                </td>
              </tr>
            ) : (expenses || []).length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-slate-400">
                  No expenses found.
                </td>
              </tr>
            ) : (
              (expenses || []).map((exp, index) => (
                <tr key={exp._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{exp.submittedBy?.name || "Unknown"}</td>
                  <td className="px-6 py-4">{exp.category}</td>
                  <td className="px-6 py-4 font-semibold">₹ {exp.amount}</td>
                  <td className="px-6 py-4">{exp.date ? new Date(exp.date).toLocaleDateString("en-IN") : "-"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === exp._id ? null : exp._id)
                      }
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuId === exp._id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50 flex flex-col">
                        {/* Admin-only Approve / Reject */}
                        {user.role.toLowerCase() === "admin" && (
                          <>
                            <button
                              onClick={() => {
                                handleStatusUpdate(exp._id, "approved");
                                setOpenMenuId(null); 
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button
                              onClick={() => {
                                handleStatusUpdate(exp._id, "rejected");
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}

                        {/* Common Actions */}
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-blue-600 hover:bg-blue-50"
                          onClick={() => setOpenMenuId(null)} 
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-orange-600 hover:bg-orange-50"
                          onClick={() => setOpenMenuId(null)} 
                        >
                          <Edit size={16} /> Update
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(exp._id);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= STATUS BADGE ================= */
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    approved: "bg-green-50 text-green-700 border-green-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {status || "pending"}
    </span>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs text-slate-500 uppercase font-medium">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon size={20} />
    </div>
  </div>
);

export default Expenses;