import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Finance = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  ////////////////////////////////////////////////////////////
  // FETCH PAYMENTS
  ////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////
  // FILTER DATA
  ////////////////////////////////////////////////////////////

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        payment.recipientName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter
        ? payment.status === statusFilter
        : true;

      const matchesType = typeFilter ? payment.type === typeFilter : true;

      const paymentDate = new Date(payment.createdAt);

      const matchesFromDate = fromDate
        ? paymentDate >= new Date(fromDate)
        : true;

      const matchesToDate = toDate
        ? paymentDate <= new Date(toDate + "T23:59:59")
        : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [payments, search, statusFilter, typeFilter, fromDate, toDate]);

  ////////////////////////////////////////////////////////////
  // SEPARATE INWARD & OUTWARD
  ////////////////////////////////////////////////////////////

  const inwardPayments = filteredPayments.filter((p) => p.type === "inward");
  const outwardPayments = filteredPayments.filter((p) => p.type === "outward");

  ////////////////////////////////////////////////////////////
  // SUMMARY
  ////////////////////////////////////////////////////////////

  const totalRevenue = filteredPayments
    .filter((p) => p.type === "inward" && p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpense = filteredPayments
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

  ////////////////////////////////////////////////////////////
  // EXPORT EXCEL
  ////////////////////////////////////////////////////////////

  const exportToExcel = () => {
    const exportData = filteredPayments.map((p, index) => ({
      "S.No": index + 1,
      Name: p.student?.name || p.recipientName || "-",
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

  ////////////////////////////////////////////////////////////
  // STATUS COLOR
  ////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////////

  if (loading)
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin w-8 h-8 text-green-600" />
      </div>
    );

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-6 py-2 rounded-xl"
        >
          Export Excel
        </button>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card title="Total Revenue" value={`₹ ${totalRevenue}`} color="text-green-600" />
        <Card title="Total Expense" value={`₹ ${totalExpense}`} color="text-red-600" />
        <Card title="Profit" value={`₹ ${profit}`} color="text-blue-600" />
        <Card title="Monthly Revenue" value={`₹ ${monthlyRevenue}`} color="text-purple-600" />

      </div>

      {/* FILTERS */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-2xl shadow">

        <input
          type="text"
          placeholder="Search"
          className="border p-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded-lg"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Type</option>
          <option value="inward">Inward</option>
          <option value="outward">Outward</option>
        </select>

        <select
          className="border p-2 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded-lg"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded-lg"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

      </div>

      {/* INWARD TABLE */}

      <Table
        title="Inward Transactions"
        payments={inwardPayments}
        getStatusColor={getStatusColor}
        showCourse
      />

      {/* OUTWARD TABLE */}

      <Table
        title="Outward Transactions"
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
                  {payment.student?.name || payment.recipientName || "-"}
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