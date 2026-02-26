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
  Banknote,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import AddExpenseModal from "./AddExpenseModel";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { role: "employee" };

  /* ================= FETCH EXPENSES ================= */
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data?.data || []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPROVE / REJECT ================= */
  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/expenses/${id}/status`, { status });
      toast.success(`Expense ${status}`);
      setOpenMenuId(null);
      fetchExpenses();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ================= REIMBURSE ================= */
  const handleReimburse = async (id) => {
    try {
      await api.patch(`/expenses/${id}/reimburse`, {
        paymentMethod: "UPI",
        transactionId: "AUTO-TXN",
      });
      toast.success("Expense reimbursed");
      setOpenMenuId(null);
      fetchExpenses();
    } catch {
      toast.error("Failed to reimburse");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      setOpenMenuId(null);
      fetchExpenses();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /* ================= STATS ================= */
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingCount = expenses.filter((e) => e.status === "pending").length;
  const approvedAmount = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expense Management</h2>
          <p className="text-sm text-slate-500">
            Track and manage expense claims
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={fetchExpenses}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Expenses" value={`₹ ${totalAmount}`} icon={DollarSign} />
        <StatCard label="Pending" value={pendingCount} icon={Clock} />
        <StatCard label="Approved Amount" value={`₹ ${approvedAmount}`} icon={CheckCircle} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
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
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{expenses.indexOf(exp) + 1}</td>
                  <td className="px-6 py-4 font-medium">
                    {exp.submittedBy?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">{exp.category}</td>
                  <td className="px-6 py-4 font-semibold">
                    ₹ {exp.amount}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(exp.date).toLocaleDateString("en-IN")}
                  </td>
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
                      <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50">

                        {user.role === "admin" && exp.status === "pending" && (
                          <>
                            <MenuButton
                              icon={CheckCircle}
                              text="Approve"
                              color="green"
                              onClick={() => handleStatusUpdate(exp._id, "approved")}
                            />
                            <MenuButton
                              icon={XCircle}
                              text="Reject"
                              color="red"
                              onClick={() => handleStatusUpdate(exp._id, "rejected")}
                            />
                          </>
                        )}

                        {user.role === "admin" && exp.status === "approved" && (
                          <MenuButton
                            icon={Banknote}
                            text="Reimburse"
                            color="blue"
                            onClick={() => handleReimburse(exp._id)}
                          />
                        )}

                        <MenuButton icon={Trash2} text="Delete" color="red" onClick={() => handleDelete(exp._id)} />
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
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    reimbursed: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

/* ================= MENU BUTTON ================= */
const MenuButton = ({ icon: Icon, text, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 w-full px-4 py-2 text-${color}-600 hover:bg-${color}-50`}
  >
    <Icon size={16} /> {text}
  </button>
);

/* ================= STAT CARD ================= */
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between">
    <div>
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
      <Icon size={20} />
    </div>
  </div>
);

export default Expenses;
