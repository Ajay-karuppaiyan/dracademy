import React, { useEffect, useState } from "react";
import { Loader2, Settings, ChevronDown } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [salaryEmployee, setSalaryEmployee] = useState(null);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceEmployee, setAttendanceEmployee] = useState(null);

  const [salaryData, setSalaryData] = useState({
    basic: 0,
    totalDays: 30,
    present: 0,
    absent: 0,
    lateDays: 0,
    lateTime: 0,
    advance: 0,

    allowances: {
      hra: 0,
      medical: 0,
      bonus: 0,
    },

    deductions: {
      pf: 0,
      tax: 0,
    },

    totalAllowances: 0,
    totalDeductions: 0,
    netSalary: 0,
  });

  const fetchEmployeeAttendance = async (employee) => {
    try {
      const res = await api.get(`/attendance?name=${encodeURIComponent(employee.name)}`);
      setAttendanceRecords(res.data);
      setAttendanceEmployee(employee);
      setAttendanceModalOpen(true);
    } catch (err) {
      toast.error("Failed to fetch attendance");
      console.error(err);
    }
  };

  // Month options
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      options.push({ value, label });
    }
    return options.reverse();
  };

  // Fetch payroll data
  const fetchPayroll = async () => {
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split("-");
    setLoading(true);
    try {
      const res = await api.get(`/payroll/salary/all?month=${month}&year=${year}`);
      setPayrolls(res.data);
      console.log("Fetched Payroll:", res.data);
    } catch (err) {
      toast.error("Failed to load payroll");
      console.error("Fetch payroll error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update totalDays whenever month changes
  useEffect(() => {
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split("-");
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    setSalaryData((prev) => ({ ...prev, totalDays: daysInMonth }));
    fetchPayroll();
  }, [selectedMonth]);

  // Open modal to create/edit payroll
  const openSalaryModal = (employee) => {
    const [year, month] = selectedMonth.split("-");
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

    setSalaryEmployee(employee);

    // Calculate total allowance/deduction from employee data if exists
    const totalAllowance = employee.allowances
      ? Object.values(employee.allowances).reduce((a, b) => a + b, 0)
      : 0;
    const totalDeduction = employee.deductions
      ? Object.values(employee.deductions).reduce((a, b) => a + b, 0)
      : 0;

    setSalaryData({
      basic: employee.basicSalary || 0,
      totalDays: daysInMonth,
      present: employee.present || 0,
      absent: employee.absent || 0,
      lateDays: employee.lateDays || 0,
      lateTime: employee.lateTime || 0,
      advance: employee.advance || 0,

      allowances: employee.allowances || {
        hra: 0,
        medical: 0,
        bonus: 0,
      },

      deductions: employee.deductions || {
        pf: 0,
        tax: 0,
      },

      totalAllowances: 0,
      totalDeductions: 0,
      netSalary: 0,
    });

    setSalaryModalOpen(true);
  };

  // Auto-calculate net salary when basic, allowances, deductions, or advance changes
  useEffect(() => {
    const totalAllowances = Object.values(salaryData.allowances)
      .reduce((sum, val) => sum + Number(val || 0), 0);

    const totalDeductions = Object.values(salaryData.deductions)
      .reduce((sum, val) => sum + Number(val || 0), 0);

    const netSalary =
      Number(salaryData.basic || 0) +
      totalAllowances -
      totalDeductions -
      Number(salaryData.advance || 0);

    setSalaryData(prev => ({
      ...prev,
      totalAllowances,
      totalDeductions,
      netSalary,
    }));

  }, [
    salaryData.basic,
    salaryData.allowances,
    salaryData.deductions,
    salaryData.advance
  ]);

  // Save payroll
  const handleSaveSalary = async () => {
    try {
      const [year, month] = selectedMonth.split("-");

      const payload = {
        employeeId: salaryEmployee.employeeId,
        name: salaryEmployee.name,
        department: salaryEmployee.department,
        month: Number(month),
        year: Number(year),
        basicSalary: Number(salaryData.basic || 0),
        totalAllowances: Number(salaryData.totalAllowances || 0),
        totalDeductions: Number(salaryData.totalDeductions || 0),
        advance: Number(salaryData.advance || 0),
        totalDays: Number(salaryData.totalDays || 30),
        present: Number(salaryData.present || 0),
        absent: Number(salaryData.absent || 0),
        lateDays: Number(salaryData.lateDays || 0),
        lateTime: Number(salaryData.lateTime || 0),
        netSalary: Number(salaryData.netSalary || 0),
        allowances: salaryData.allowances,
        deductions: salaryData.deductions,
      };

      await api.post("/payroll", payload);

      await fetchPayroll(); 

      toast.success("Payroll saved successfully");
      setSalaryModalOpen(false);
    } catch (err) {
      console.error("Save payroll error:", err);
      toast.error("Failed to save payroll");
    }
  };

  // Initialize month
  useEffect(() => {
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-600 font-medium">Total Monthly Liability</p>
          <h3 className="text-2xl font-bold text-green-600">
            ₹ {payrolls.reduce((sum, e) => sum + (e.netSalary || 0), 0)}
          </h3>
        </div>
        <div className="relative w-40">
          <button
            onClick={() => setShowMonthGrid(!showMonthGrid)}
            className="px-4 py-2 rounded border w-full flex justify-between items-center bg-white"
          >
            {selectedMonth &&
              new Date(selectedMonth).toLocaleString("default", { month: "short", year: "numeric" })}
            <ChevronDown size={16} />
          </button>
          {showMonthGrid && (
            <div className="absolute top-12 right-0 bg-white border rounded shadow-lg p-3 grid grid-cols-3 gap-2 z-50">
              {getMonthOptions().map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    setSelectedMonth(m.value);
                    setShowMonthGrid(false);
                  }}
                  className={`px-3 py-2 rounded text-sm ${
                    selectedMonth === m.value ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
<div className="bg-white rounded-xl border shadow-sm p-4 overflow-x-auto">
  {loading ? (
    <div className="flex justify-center py-8">
      <Loader2 className="animate-spin text-gray-500" size={32} />
    </div>
  ) : (
    <table className="w-full text-sm text-center border-collapse min-w-[900px]">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          {[
            "S.No", "Name", "Department", "Total Days", "Salary", "Present", "Absent",
            "Late Days", "Late Time", "Total Allowances", "Total Deductions", 
            "Advance", "Net Salary", "Actions"
          ].map((heading) => (
            <th
              key={heading}
              className="border px-3 py-2 text-gray-700 font-medium tracking-wide whitespace-nowrap"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {payrolls.length === 0 ? (
          <tr>
            <td colSpan={14} className="py-6 text-gray-500">
              No payroll records found.
            </td>
          </tr>
        ) : (
          payrolls.map((p, index) => (
            <tr
              key={p.employeeId}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="border px-3 py-2 whitespace-nowrap">{index + 1}</td>
              <td className="border px-3 py-2 whitespace-nowrap max-w-[150px] truncate">{p.name}</td>
              <td className="border px-3 py-2 whitespace-nowrap">{p.department}</td>
              <td className="border px-3 py-2 whitespace-nowrap">{p.totalDays}</td>
              <td className="border px-3 py-2 whitespace-nowrap text-right">₹{p.basicSalary}</td>
              <td className="border px-3 py-2 whitespace-nowrap">{p.present}</td>
              <td className="border px-3 py-2 whitespace-nowrap">{p.absent}</td>
              <td className="border px-3 py-2 whitespace-nowrap">{p.lateDays}</td>
              <td className="border px-3 py-2 whitespace-nowrap">{p.lateTime}</td>
              <td className="border px-3 py-2 whitespace-nowrap text-right">₹{p.totalAllowances}</td>
              <td className="border px-3 py-2 whitespace-nowrap text-right">₹{p.totalDeductions}</td>
              <td className="border px-3 py-2 whitespace-nowrap text-right">₹{p.advance}</td>
              <td className="border px-3 py-2 whitespace-nowrap font-bold text-green-600 text-right">
                ₹{p.netSalary}
              </td>
              <td className="border px-3 py-2 whitespace-nowrap flex gap-2 justify-center">
                <button
                  onClick={() => openSalaryModal(p)}
                  className="flex items-center gap-1 px-2 py-1 text-indigo-600 hover:text-indigo-800 font-medium transition"
                >
                  <Settings size={16} /> Edit
                </button>
                <button
                  onClick={() => fetchEmployeeAttendance(p)}
                  className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 font-medium transition"
                >
                  📅 Attendance
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )}
</div>

      {/* Edit Modal */}
 {salaryModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-3xl shadow-lg flex flex-col max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Edit Salary</h2>
        <button
          onClick={() => setSalaryModalOpen(false)}
          className="text-gray-500 text-2xl font-bold hover:text-gray-800"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 space-y-6">

        {/* ===== BASIC SALARY DETAILS ===== */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
            Salary Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Basic Salary", key: "basic" },
              { label: "Total Days", key: "totalDays", readOnly: true },
              { label: "Present", key: "present" },
              { label: "Absent", key: "absent" },
              { label: "Late Days", key: "lateDays" },
              { label: "Late Time (min)", key: "lateTime" },
              { label: "Advance", key: "advance" },
            ].map((field) => (
              <div key={field.key} className="flex flex-col space-y-1">
                <label className="text-xs text-gray-600">{field.label}</label>
                <div className="flex items-center border rounded-md px-2 bg-white focus-within:ring-2 focus-within:ring-green-400">
                  {!field.readOnly && <span className="text-gray-400 text-sm">₹</span>}
                  <input
                    type="number"
                    value={salaryData[field.key]}
                    readOnly={field.readOnly}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        [field.key]: Number(e.target.value),
                      })
                    }
                    className={`w-full p-2 text-right outline-none ${
                      field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ALLOWANCES ===== */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-green-700 text-sm">Allowances</h3>
            <span className="text-green-600 font-semibold">₹ {salaryData.totalAllowances}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["hra", "medical", "bonus"].map((key) => (
              <div key={key} className="flex flex-col space-y-1">
                <label className="text-xs capitalize text-gray-600">{key}</label>
                <div className="flex items-center border rounded-md px-2 bg-white focus-within:ring-2 focus-within:ring-green-400">
                  <span className="text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={salaryData.allowances[key]}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        allowances: { ...salaryData.allowances, [key]: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2 text-right outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== DEDUCTIONS ===== */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-red-700 text-sm">Deductions</h3>
            <span className="text-red-600 font-semibold">₹ {salaryData.totalDeductions}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["pf", "tax"].map((key) => (
              <div key={key} className="flex flex-col space-y-1">
                <label className="text-xs uppercase text-gray-600">{key}</label>
                <div className="flex items-center border rounded-md px-2 bg-white focus-within:ring-2 focus-within:ring-red-400">
                  <span className="text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={salaryData.deductions[key]}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        deductions: { ...salaryData.deductions, [key]: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2 text-right outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SUMMARY CARD ===== */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Allowances</span>
            <span className="text-green-600 font-medium">+ ₹ {salaryData.totalAllowances}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Deductions</span>
            <span className="text-red-600 font-medium">- ₹ {salaryData.totalDeductions}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Advance</span>
            <span className="text-red-600 font-medium">- ₹ {salaryData.advance}</span>
          </div>
          <div className="border-t mt-2 pt-2 flex justify-between text-base font-bold">
            <span>Net Salary</span>
            <span className="text-green-700">₹ {salaryData.netSalary}</span>
          </div>
        </div>
      </div>

      {/* Sticky Footer Buttons */}
      <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0 z-10">
        <button
          onClick={() => setSalaryModalOpen(false)}
          className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSalary}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{attendanceModalOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
    onClick={() => setAttendanceModalOpen(false)}
  >
    <div
      className="bg-white rounded-xl w-full max-w-3xl shadow-lg flex flex-col max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Attendance - {attendanceEmployee?.name}
        </h2>
        <button
          onClick={() => setAttendanceModalOpen(false)}
          className="text-gray-500 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse border text-center">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {["S.No", "Date", "Login Time", "Logout Time", "Working Hours"].map((h, i) => (
                <th key={i} className="border px-3 py-2 text-sm text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-gray-500">No records found</td>
              </tr>
            ) : (
              attendanceRecords.map((a, idx) => {
                const login = a.loginTime ? new Date(`1970-01-01T${a.loginTime}`) : null;
                const logout = a.logoutTime ? new Date(`1970-01-01T${a.logoutTime}`) : null;
                const workingHours = login && logout
                  ? `${Math.floor((logout - login) / 3600000)}h ${Math.floor(((logout - login) % 3600000) / 60000)}m`
                  : "-";
                const formatTime = (t) => t ? new Date(`1970-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-";

                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border px-3 py-2">{idx + 1}</td>
                    <td className="border px-3 py-2">{a.date}</td>
                    <td className="border px-3 py-2">{formatTime(a.loginTime)}</td>
                    <td className="border px-3 py-2">{formatTime(a.logoutTime)}</td>
                    <td className="border px-3 py-2">{workingHours}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Payroll;
