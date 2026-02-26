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

      if (Array.isArray(res.data)) {
        setPayments(res.data);
      } else if (Array.isArray(res.data.payments)) {
        setPayments(res.data.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.user?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        payment.userName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = statusFilter
        ? payment.status === statusFilter
        : true;

      const paymentDate = new Date(payment.createdAt);

      const matchesFromDate = fromDate
        ? paymentDate >= new Date(fromDate)
        : true;

      const matchesToDate = toDate
        ? paymentDate <= new Date(toDate + "T23:59:59")
        : true;

      return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
    });
  }, [payments, search, statusFilter, fromDate, toDate]);

  const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filteredPayments.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = filteredPayments.length;

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments
      .filter((p) => {
        const date = new Date(p.createdAt);
        return (
          p.status === "success" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const exportToExcel = () => {
    const exportData = filteredPayments.map((p, index) => ({
      "S.No": index + 1,
      Student: p.user?.name || p.userName,
      Course: p.course?.title || "-",
      Amount: p.amount,
      Currency: p.currency,
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

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
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
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-800">
          Finance Dashboard
        </h1>

        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-2.5 rounded-xl shadow-md w-full md:w-auto"
        >
          Export Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            ₹ {totalRevenue}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            ₹ {monthlyRevenue}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <h2 className="text-3xl font-bold mt-2">
            {totalTransactions}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Search Student</label>
          <input
            type="text"
            placeholder="Enter student name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 rounded-lg w-full"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 rounded-lg w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4">S.No</th>
              <th className="p-4">Student</th>
              <th className="p-4">Course</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              currentRecords.map((payment, index) => (
                <tr key={payment._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">{indexOfFirst + index + 1}</td>
                  <td className="p-4">{payment.user?.name || payment.userName}</td>
                  <td className="p-4">{payment.course?.title || "-"}</td>
                  <td className="p-4">{payment.currency} {payment.amount}</td>
                  <td className="p-4">{payment.paymentMethod || "-"}</td>
                  <td className="p-4">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded-lg"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-800 transition text-white rounded-lg disabled:bg-gray-300"
          >
            Previous
          </button>

          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-800 transition text-white rounded-lg disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Payment Details
            </h2>

            <div className="space-y-3 text-sm">
              <p><strong>Student:</strong> {selectedPayment.user?.name}</p>
              <p><strong>Course:</strong> {selectedPayment.course?.title}</p>
              <p><strong>Amount:</strong> ₹ {selectedPayment.amount}</p>
              <p><strong>Status:</strong> {selectedPayment.status}</p>
              <p><strong>Method:</strong> {selectedPayment.paymentMethod}</p>
              <p><strong>Order ID:</strong> {selectedPayment.razorpayOrderId}</p>
              <p><strong>Payment ID:</strong> {selectedPayment.razorpayPaymentId}</p>
            </div>

            <div className="text-right mt-6">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-slate-700 hover:bg-slate-800 transition text-white px-5 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;