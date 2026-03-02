import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { Loader2, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Finance = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

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
  // FILTERED DATA
  ////////////////////////////////////////////////////////////
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.student?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        payment.userName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        payment.recipientName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = statusFilter
        ? payment.status === statusFilter
        : true;

      const matchesType = typeFilter
        ? payment.type === typeFilter
        : true;

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
  // PAGINATION
  ////////////////////////////////////////////////////////////
  const totalPages = Math.ceil(
    filteredPayments.length / recordsPerPage
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filteredPayments.slice(
    indexOfFirst,
    indexOfLast
  );

  ////////////////////////////////////////////////////////////
  // SUMMARY CALCULATIONS
  ////////////////////////////////////////////////////////////
  const totalRevenue = filteredPayments
    .filter(
      (p) => p.type === "inward" && p.status === "success"
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpense = filteredPayments
    .filter(
      (p) => p.type === "outward" && p.status === "paid"
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const profit = totalRevenue - totalExpense;

  const totalTransactions = filteredPayments.length;

  ////////////////////////////////////////////////////////////
  // MONTHLY REVENUE
  ////////////////////////////////////////////////////////////
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments
      .filter((p) => {
        const date = new Date(p.createdAt);
        return (
          p.type === "inward" &&
          p.status === "success" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
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
      Type: p.type,
      Name:
        p.student?.name ||
        p.recipientName ||
        p.userName,
      Course: p.course?.title || "-",
      Amount: p.amount,
      Currency: p.currency,
      Status: p.status,
      Date: new Date(p.createdAt).toLocaleDateString(),
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Finance"
    );

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

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Finance Dashboard
        </h1>

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-6 py-2 rounded-xl"
        >
          Export Excel
        </button>
      </div>

      {/* SUMMARY CARDS */}
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">All Type</option>
          <option value="inward">Inward</option>
          <option value="outward">Outward</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded-lg"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded-lg"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">S.No</th>
              <th className="p-4">Type</th>
              <th className="p-4">Name</th>
              <th className="p-4">Course</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentRecords.map((payment, index) => (
              <tr key={payment._id} className="border-t">
                <td className="p-4">{indexOfFirst + index + 1}</td>
                <td className="p-4 capitalize">{payment.type}</td>
                <td className="p-4">
                  {payment.student?.name ||
                    payment.recipientName ||
                    payment.userName}
                </td>
                <td className="p-4">
                  {payment.course?.title || "-"}
                </td>
                <td className="p-4">
                  {payment.currency} {payment.amount}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() =>
                      setSelectedPayment(payment)
                    }
                    className="bg-blue-600 text-white p-2 rounded-lg"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className={`text-2xl font-bold mt-2 ${color}`}>
      {value}
    </h2>
  </div>
);

export default Finance;