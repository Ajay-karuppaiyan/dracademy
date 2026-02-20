import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Ban,
  Unlock,
  Edit,
} from "lucide-react";
import AddEmployeeModal from "../../components/modals/AddEmployeeModal";
import api from "../../services/api";
import toast from "react-hot-toast";
import Payroll from "../../pages/payroll/Payroll";

const EmployeeList = ({ employees, loading, onEdit, onToggleStatus, onDelete }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Table Header / Filters */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search employees by name, ID, or role..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">SL No</th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role / Dept</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="animate-spin" size={24} />
                    <span>Loading employees...</span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => (
                <tr key={emp._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-600">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-50 border border-slate-200 overflow-hidden">
                        {emp.profilePic?.url ? (
                          <img
                            src={emp.profilePic.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold">
                            {emp.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{emp.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 lowercase capitalize">
                      {emp.user?.role || "Employee"}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {emp.department} • {emp.designation}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        emp.status === "active"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-yellow-50 text-yellow-700 border-yellow-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === "active" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={12} /> {emp.user?.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={12} /> {emp.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => toggleMenu(emp._id)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === emp._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        ></div>
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              onEdit(emp);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit size={16} className="text-slate-400" />
                            Edit Details
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => {
                              onToggleStatus(emp._id);
                              setOpenMenuId(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              emp.status === "active"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {emp.status === "active" ? (
                              <>
                                <Ban size={16} /> Block Employee
                              </>
                            ) : (
                              <>
                                <Unlock size={16} /> Unblock Employee
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${emp.firstName}?`)) {
                                onDelete(emp._id);
                                setOpenMenuId(null);
                              }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={16} /> Delete Employee
                          </button>
                        </div>
                      </>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {employees.length} of {employees.length} employees
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const HR = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [user, setUser] = useState(null); // logged-in user

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      toast.error("Failed to fetch user info");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/employees/${id}/status`);
      toast.success(res.data.message);
      fetchEmployees();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleEditInitiate = (employee) => {
    setSelectedEmployee(employee);
    setIsAddModalOpen(true);
  };

  // --- Delete Handler ---
  const handleDeleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        employee={selectedEmployee}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedEmployee(null);
          fetchEmployees();
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employee Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your staff profiles, roles, and records.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedEmployee(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: employees.length, icon: Users, color: "blue" },
          {
            label: "Active Staff",
            value: employees.filter((e) => e.status === "active").length,
            icon: CheckCircle,
            color: "green",
          },
          {
            label: "Total Roles",
            value: [...new Set(employees.map((e) => e.user?.role))].length,
            icon: Clock,
            color: "orange",
          },
          {
            label: "Dept. Count",
            value: [...new Set(employees.map((e) => e.department))].length,
            icon: Briefcase,
            color: "purple",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {["employees", "payroll"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "employees" && (
          <EmployeeList
            employees={employees}
            loading={loading}
            onRefresh={fetchEmployees}
            onEdit={handleEditInitiate}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteEmployee}
          />
        )}

        {activeTab === "payroll" && <Payroll />}
      </div>
    </div>
  );
};

export default HR;
