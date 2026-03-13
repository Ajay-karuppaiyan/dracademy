import React, { useEffect, useState, useRef } from "react";
import { Loader2, Plus, ChevronDown } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Payroll = () => {
const { user } = useAuth();
const [payrolls, setPayrolls] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedMonth, setSelectedMonth] = useState("");
const [showMonthGrid, setShowMonthGrid] = useState(false);
const [payrollFormOpen, setPayrollFormOpen] = useState(false);
const [employees, setEmployees] = useState([]);
const [selectedEmployee, setSelectedEmployee] = useState(null);
const [salaryData, setSalaryData] = useState({
adjustmentType: "",
adjustmentMonth: "",
adjustmentAmount: 0,
adjustmentNote: ""
});

const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [attendanceSummary, setAttendanceSummary] = useState({
present: 0,
absent: 0,
remainingDays: 0
});

const [selectedAttendanceEmployee, setSelectedAttendanceEmployee] = useState(null);
const tableRef = useRef(null);
const [highlightedRow, setHighlightedRow] = useState(null);
const [attendanceData, setAttendanceData] = useState({});

// fetchAttendanceSummary logic moved to backend payroll controller for performance and reliability

/* ==============================
FETCH EMPLOYEES
================================ */
useEffect(() => {
if (user.role === "admin" || user.role === "Hr") {
api.get("/employees")
.then(res => {
setEmployees(res.data);
})
.catch(() => toast.error("Failed to fetch employees"));
} else {
setSelectedEmployee({
_id: user.id,
firstName: user.name,
lastName: ""
});
}
}, [user]);

/* ==============================
MONTH OPTIONS
================================ */
const getMonthOptions = () => {
const options = [];
const now = new Date();
for (let i = 0; i < 12; i++) {
const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
options.push({
value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
label: d.toLocaleString("default", { month: "short", year: "numeric" })
});
}
return options.reverse();
};

/* ==============================
FETCH PAYROLLS
================================ */
const fetchPayrolls = async () => {
  if (!selectedMonth) return;
  const [year, month] = selectedMonth.split("-");
  setLoading(true);
  try {
    const res = await api.get(`/payroll/salary/all?month=${month}&year=${year}`);
    setPayrolls(res.data);
  } catch (err) {
    console.error("Failed to load payroll", err);
    toast.error("Failed to load payroll");
  }
  setLoading(false);
};

/* ==============================
DEFAULT MONTH
================================ */
useEffect(() => {
const now = new Date();
setSelectedMonth(
`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
);
}, []);

useEffect(() => {
if (selectedMonth) fetchPayrolls();
}, [selectedMonth]);

/* ==============================
OPEN ADJUSTMENT FORM
================================ */
const openPayrollForm = () => {
if (user.role === "admin") setSelectedEmployee(null);
setSalaryData(prev => ({
...prev,
adjustmentMonth: selectedMonth
}));
setPayrollFormOpen(true);
};

/* ==============================
SAVE ADJUSTMENT
================================ */
const handleSavePayroll = async () => {

if (!selectedEmployee) return toast.error("Select employee");
if (!salaryData.adjustmentMonth) return toast.error("Select month");
if (!salaryData.adjustmentType) return toast.error("Select type");
if (!salaryData.adjustmentAmount) return toast.error("Enter amount");

try {
const [year, month] = salaryData.adjustmentMonth.split("-");
const payload = {
employeeId: selectedEmployee._id,
type: salaryData.adjustmentType,
month: Number(month),
year: Number(year),
amount: salaryData.adjustmentAmount,
note: salaryData.adjustmentNote || ""
};

await api.post("/payroll/adjustment", payload);
toast.success("Payroll adjustment saved");
await fetchPayrolls();
setHighlightedRow(selectedEmployee._id);
setTimeout(() => {
const row = document.getElementById(`row-${selectedEmployee._id}`);
if (row) {
row.scrollIntoView({
behavior: "smooth",
block: "center"
});
}
}, 100);
setPayrollFormOpen(false);
setSalaryData({
adjustmentType: "",
adjustmentMonth: selectedMonth,
adjustmentAmount: 0,
adjustmentNote: ""
});
} catch (err) {
console.error(err);
toast.error("Failed to save adjustment");
}
};

/* ==============================
FETCH ATTENDANCE SUMMARY
================================ */
const fetchAttendance = async (employee) => {
  if (!selectedMonth) return;
  const [year, month] = selectedMonth.split("-");
  setAttendanceLoading(true);
  setSelectedAttendanceEmployee(employee);

  try {
    // Fetch daily attendance for the employee
    const res = await api.get(
      `/attendance/employee/${employee.userId}/monthly?month=${Number(month)}&year=${Number(year)}`
    );
    // res.data is an array of attendance records
    setAttendanceSummary(res.data || []);
    setAttendanceModalOpen(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch attendance");
  }
  setAttendanceLoading(false);
};

/* ==============================
UI
================================ */
return (

<div className="space-y-6">
{/* HEADER */}
{/* HEADER */}
<div className="flex justify-between items-center bg-white border p-4 rounded-xl">
  <div className="flex items-center gap-2">
    <span className="text-gray-600 font-medium">
      Month:
    </span>

    <div className="relative">
      <button
        onClick={() => setShowMonthGrid(!showMonthGrid)}
        className="px-3 py-2 border rounded flex items-center gap-2"
      >
        {selectedMonth &&
          new Date(selectedMonth).toLocaleString("default", {
            month: "short",
            year: "numeric"
          })}
        <ChevronDown size={16} />
      </button>

      {showMonthGrid && (
        <div className="absolute top-10 left-0 bg-white border shadow-lg rounded p-2 grid grid-cols-3 gap-2 z-50">
          {getMonthOptions().map(m => (
            <button
              key={m.value}
              onClick={() => {
                setSelectedMonth(m.value);
                setShowMonthGrid(false);
              }}
              className={`px-2 py-1 rounded text-sm ${
                selectedMonth === m.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>

  {/* MOVE ADJUSTMENT BUTTON TO RIGHT */}
  <button
    onClick={openPayrollForm}
    className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    <Plus size={16} />
    Adjustment
  </button>
</div>

{/* PAYROLL TABLE */}
<div
ref={tableRef}
className="bg-white border rounded-xl shadow-sm overflow-x-auto max-h-[500px]"
>

{loading ? (
<div className="flex justify-center py-8">
<Loader2 className="animate-spin" size={32} />
</div>

) : (
<table className="w-full text-sm text-center border-collapse min-w-[900px]">
<thead className="bg-gray-50 sticky top-0">
<tr>

<th className="border px-3 py-2">S.No</th>
<th className="border px-3 py-2">Name</th>
<th className="border px-3 py-2">Basic Salary</th>
<th className="border px-3 py-2">Total Days</th>
<th className="border px-3 py-2">Present</th>
<th className="border px-3 py-2">Leave</th>
<th className="border px-3 py-2">Late Days</th>
<th className="border px-3 py-2">Late Time</th>
<th className="border px-3 py-2">Allowances</th>
<th className="border px-3 py-2">Deductions</th>
<th className="border px-3 py-2">Advance</th>
<th className="border px-3 py-2">Net Salary</th>

</tr>
</thead>
<tbody>

{payrolls.length === 0 ? (
<tr>
<td colSpan={12} className="py-6 text-gray-500">
No payroll found
</td>
</tr>

) : (
          payrolls.map((p, i) => {
            return (
              <tr
                key={p.employeeId}
                id={`row-${p.employeeId}`}
                className={`${
                  highlightedRow === p.employeeId ? "bg-yellow-100" : ""
                }`}
              >
                <td className="border px-3 py-2">{i + 1}</td>

                <td
                  className="border px-3 py-2 text-black cursor-pointer"
                  onClick={() => fetchAttendance(p)}
                >
                  {p.name}
                </td>

                <td className="border px-3 py-2">₹{p.basic}</td>
                <td className="border px-3 py-2">{p.totalDays || "-"}</td>

                <td className="border px-3 py-2">{p.present ?? "-"}</td>
                <td className="border px-3 py-2">{p.absent ?? "-"}</td>
                <td className="border px-3 py-2">{p.lateDays ?? "-"}</td>
                <td className="border px-3 py-2">{p.lateTime ?? "-"}</td>

                <td className="border px-3 py-2">₹{p.allowances}</td>
                <td className="border px-3 py-2">₹{p.deductions}</td>
                <td className="border px-3 py-2">₹{p.advance}</td>

                <td className="border px-3 py-2 font-bold text-green-600">
                  ₹{p.netSalary}
                </td>
              </tr>
            );
          })
      )}
    </tbody>
  </table>
)}
</div>

{attendanceModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl p-6 w-96 shadow-lg max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Attendance - {selectedAttendanceEmployee?.firstName || selectedAttendanceEmployee?.name}
        </h2>
        <button
          onClick={() => setAttendanceModalOpen(false)}
          className="text-xl font-bold"
        >
          ×
        </button>
      </div>

      {attendanceLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Login</th>
                <th className="border px-2 py-1">Logout</th>
                <th className="border px-2 py-1">Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceSummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-gray-500 text-center">
                    No attendance records for this month
                  </td>
                </tr>
              ) : (
                attendanceSummary.map((record, index) => (
                  <tr key={record._id} className={record.type === "leave" ? "bg-red-50" : ""}>
                    <td className="border px-2 py-1">
                      {new Date(record.date || record.startDate).toLocaleDateString()}
                    </td>
                    <td className="border px-2 py-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        record.type === "leave" ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"
                      }`}>
                        {record.type === "leave" ? "Leave" : "Present"}
                      </span>
                    </td>
                    <td className="border px-2 py-1">{record.loginTime || "-"}</td>
                    <td className="border px-2 py-1">{record.logoutTime || "-"}</td>
                    <td className="border px-2 py-1 text-center font-mono">
                      {record.type === "attendance" ? record.workingHours || "-" : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

{/* ADJUSTMENT MODAL */}
{payrollFormOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg space-y-4">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Payroll Adjustment</h2>
        <button
          onClick={() => setPayrollFormOpen(false)}
          className="text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* EMPLOYEE */}

      <select
        className="w-full border p-2 rounded"
        value={selectedEmployee?._id || ""}
        onChange={(e) =>
          setSelectedEmployee(
            employees.find((emp) => emp._id === e.target.value)
          )
        }
      >
        <option value="">Select Employee</option>
        {employees.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.firstName} {emp.lastName}
          </option>
        ))}
      </select>

      {/* TYPE */}
      <select
        className="w-full border p-2 rounded"
        value={salaryData.adjustmentType}
        onChange={(e) =>
          setSalaryData({
            ...salaryData,
            adjustmentType: e.target.value
          })
        }
      >
        <option value="">Select Type</option>
        <option value="allowance">Allowance</option>
        <option value="deduction">Deduction</option>
        <option value="advance">Advance</option>
      </select>

      {/* AMOUNT */}
      <input
        type="number"
        placeholder="Amount"
        className="w-full border p-2 rounded"
        value={salaryData.adjustmentAmount}
        onChange={(e) =>
          setSalaryData({
            ...salaryData,
            adjustmentAmount: e.target.value
          })
        }
      />

      {/* NOTE */}
      <textarea
        placeholder="Note (optional)"
        className="w-full border p-2 rounded"
        value={salaryData.adjustmentNote}
        onChange={(e) =>
          setSalaryData({
            ...salaryData,
            adjustmentNote: e.target.value
          })
        }
      />

      <button
        onClick={handleSavePayroll}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Save Adjustment
      </button>

    </div>
  </div>
)}
</div>
);};

export default Payroll;