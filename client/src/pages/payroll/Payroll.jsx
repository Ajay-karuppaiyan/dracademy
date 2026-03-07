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



/* ==============================
FETCH EMPLOYEES
================================ */
useEffect(() => {

if (user.role === "admin") {

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

} catch {

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
console.log(employee);
if (!selectedMonth) return;

const [year, month] = selectedMonth.split("-");

setAttendanceLoading(true);

setSelectedAttendanceEmployee(employee);

try {

const res = await api.get(
`/attendance/${employee.employeeId || employee._id}?month=${month}&year=${year}`
);

const { present, absent } = res.data;

const totalDays = new Date(year, month, 0).getDate();

const remainingDays = totalDays - (present + absent);

setAttendanceSummary({
present,
absent,
remainingDays
});

setAttendanceModalOpen(true);

} catch {

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
<div className="flex justify-between items-center bg-white border p-4 rounded-xl">

<div className="flex items-center gap-2">

<button
onClick={openPayrollForm}
className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
>
<Plus size={16} />
Adjustment
</button>

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
<th className="border px-3 py-2">Basic</th>
<th className="border px-3 py-2">Allowances</th>
<th className="border px-3 py-2">Deductions</th>
<th className="border px-3 py-2">Advance</th>
<th className="border px-3 py-2">Net Salary</th>

</tr>

</thead>

<tbody>

{payrolls.length === 0 ? (

<tr>
<td colSpan={7} className="py-6 text-gray-500">
No payroll found
</td>
</tr>

) : (

payrolls.map((p, i) => (

<tr
key={p.employeeId}
id={`row-${p.employeeId}`}
className={`${
highlightedRow === p.employeeId
? "bg-yellow-100"
: ""
}`}
>

<td className="border px-3 py-2">{i + 1}</td>

<td
className="border px-3 py-2 text-blue-600 cursor-pointer underline"
onClick={() => fetchAttendance(p)}
>

{p.name}

</td>

<td className="border px-3 py-2">₹{p.basic}</td>
<td className="border px-3 py-2">₹{p.allowances}</td>
<td className="border px-3 py-2">₹{p.deductions}</td>
<td className="border px-3 py-2">₹{p.advance}</td>

<td className="border px-3 py-2 font-bold text-green-600">
₹{p.netSalary}
</td>

</tr>

))

)}

</tbody>

</table>

)}

</div>



{/* ATTENDANCE MODAL */}
{attendanceModalOpen && (

<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

<div className="bg-white rounded-xl p-6 w-96 shadow-lg">

<div className="flex justify-between items-center mb-4">

<h2 className="text-lg font-semibold">
Attendance Summary
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

<div className="grid grid-cols-3 gap-4 text-center">

<div className="bg-green-100 p-3 rounded">
<p className="text-sm text-gray-600">Present</p>
<p className="text-lg font-bold">
{attendanceSummary.present}
</p>
</div>

<div className="bg-red-100 p-3 rounded">
<p className="text-sm text-gray-600">Leave</p>
<p className="text-lg font-bold">
{attendanceSummary.absent}
</p>
</div>

<div className="bg-blue-100 p-3 rounded">
<p className="text-sm text-gray-600">Remaining</p>
<p className="text-lg font-bold">
{attendanceSummary.remainingDays}
</p>
</div>

</div>

)}

</div>

</div>

)}

</div>

);

};

export default Payroll;