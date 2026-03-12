import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Finance = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inward Filters
  const [inwardSearch, setInwardSearch] = useState("");
  const [inwardFromDate, setInwardFromDate] = useState("");
  const [inwardToDate, setInwardToDate] = useState("");

  // Outward Filters
  const [outwardSearch, setOutwardSearch] = useState("");
  const [outwardFromDate, setOutwardFromDate] = useState("");
  const [outwardToDate, setOutwardToDate] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/finance/payments");
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const inwardPayments = payments.filter((p) => {
    if (p.type?.toLowerCase() !== "inward") return false;

    const matchesSearch =
      p.student?.studentNameEnglish
        ?.toLowerCase()
        ?.includes(inwardSearch.toLowerCase()) ||
      p.recipientName?.toLowerCase()?.includes(inwardSearch.toLowerCase()) ||
      inwardSearch === "";

    const paymentDate = new Date(p.createdAt);

    const matchesFromDate = inwardFromDate
      ? paymentDate >= new Date(inwardFromDate)
      : true;

    const matchesToDate = inwardToDate
      ? paymentDate <= new Date(inwardToDate + "T23:59:59")
      : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const outwardPayments = payments.filter((p) => {
    if (p.type?.toLowerCase() !== "outward") return false;

    const matchesSearch =
      p.recipientName?.toLowerCase()?.includes(outwardSearch.toLowerCase()) ||
      outwardSearch === "";

    const paymentDate = new Date(p.createdAt);

    const matchesFromDate = outwardFromDate
      ? paymentDate >= new Date(outwardFromDate)
      : true;

    const matchesToDate = outwardToDate
      ? paymentDate <= new Date(outwardToDate + "T23:59:59")
      : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const totalRevenue = payments
    .filter((p) => p.type === "inward" && p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpense = payments
    .filter((p) => p.type === "outward" && p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const profit = totalRevenue - totalExpense;

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return payments
      .filter((p) => {
        const d = new Date(p.createdAt);
        return (
          p.type === "inward" &&
          p.status === "success" &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const exportToExcel = () => {
    const exportData = filteredPayments.map((p, index) => ({
      "S.No": index + 1,
      Name: p.student?.studentNameEnglish || p.recipientName || "-",
      Course: p.course?.title || "-",
      Type: p.type,
      Amount: p.amount,
      Status: p.status,
      Date: new Date(p.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Finance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Finance_Report.xlsx");
  };

  const applyDateFilter = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setShowDateFilter(false);
  };

  const clearDateFilter = () => {
    setTempFromDate("");
    setTempToDate("");
    setFromDate("");
    setToDate("");
    setShowDateFilter(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin w-8 h-8 text-green-600" />
      </div>
    );

return (
  <div className="p-6 space-y-8 bg-slate-50 min-h-screen">

    {/* HEADING */}
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Finance Dashboard</h1>

      <button
        onClick={exportToExcel}
        className="bg-green-600 text-white px-6 py-2 rounded-xl"
      >
        Export Excel
      </button>
    </div>

    {/* CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card title="Total Revenue" value={`₹ ${totalRevenue}`} color="text-green-600" />
      <Card title="Total Expense" value={`₹ ${totalExpense}`} color="text-red-600" />
      <Card title="Profit" value={`₹ ${profit}`} color="text-blue-600" />
      <Card title="Monthly Revenue" value={`₹ ${monthlyRevenue}`} color="text-purple-600" />
    </div>

    {/* ===================== INWARD SECTION ===================== */}

    <h2 className="text-2xl font-semibold">Inward Transactions</h2>

    {/* INWARD FILTER */}
    <div className="flex justify-between bg-white p-4 rounded-xl shadow items-center">

      <input
        type="text"
        placeholder="Search Inward..."
        className="border p-2 rounded-lg"
        value={inwardSearch}
        onChange={(e) => setInwardSearch(e.target.value)}
      />

      <div className="flex gap-3 items-center">

        <div>
          <label className="text-sm font-semibold text-gray-700">Start Date  :  </label>
          <input
            type="date"
            className="border p-2 rounded-lg"
            value={inwardFromDate}
            onChange={(e) => setInwardFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">End Date  :  </label>
          <input
            type="date"
            className="border p-2 rounded-lg"
            value={inwardToDate}
            onChange={(e) => setInwardToDate(e.target.value)}
          />
        </div>

      </div>
    </div>

    {/* INWARD TABLE */}
    <Table
      payments={inwardPayments}
      getStatusColor={getStatusColor}
      showCourse
    />

    {/* ===================== OUTWARD SECTION ===================== */}

    <h2 className="text-2xl font-semibold">Outward Transactions</h2>

    {/* OUTWARD FILTER */}
    <div className="flex justify-between bg-white p-4 rounded-xl shadow items-center">

      <input
        type="text"
        placeholder="Search Outward..."
        className="border p-2 rounded-lg"
        value={outwardSearch}
        onChange={(e) => setOutwardSearch(e.target.value)}
      />

      <div className="flex gap-3 items-center">

        <div>
          <label className="text-sm font-semibold text-gray-700">Start Date  :  </label>
          <input
            type="date"
            className="border p-2 rounded-lg"
            value={outwardFromDate}
            onChange={(e) => setOutwardFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">End Date  :  </label>
          <input
            type="date"
            className="border p-2 rounded-lg"
            value={outwardToDate}
            onChange={(e) => setOutwardToDate(e.target.value)}
          />
        </div>

      </div>
    </div>

    {/* OUTWARD TABLE */}
    <Table
      payments={outwardPayments}
      getStatusColor={getStatusColor}
    />

  </div>
);
};

////////////////////////////////////////////////////////////
// TABLE COMPONENT
////////////////////////////////////////////////////////////

const Table = ({ title, payments, getStatusColor, showCourse }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="w-full text-sm text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4">S.No</th>
            <th className="p-4">Name</th>
            {showCourse && <th className="p-4">Course</th>}
            <th className="p-4">Amount</th>
            <th className="p-4">Status</th>
            <th className="p-4">Date</th>
          </tr>
        </thead>

        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-6 text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            payments.map((payment, index) => (
              <tr key={payment._id} className="border-t">
                <td className="p-4">{index + 1}</td>

                <td className="p-4">
                  {payment.student?.studentNameEnglish ||
                  payment.recipientName ||
                  payment.student?.email ||
                  "N/A"}
                </td>

                {showCourse && (
                  <td className="p-4">
                    {payment.course?.title || "-"}
                  </td>
                )}

                <td className="p-4">
                  ₹ {payment.amount}
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>

                <td className="p-4">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// CARD

const Card = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h2>
  </div>
);

export default Finance;