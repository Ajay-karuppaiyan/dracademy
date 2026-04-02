import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CustomDataTable from "../components/DataTable";

const Finance = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Search Filters
  const [inwardSearch, setInwardSearch] = useState("");
  const [outwardSearch, setOutwardSearch] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [selectedMonth]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-");
      const res = await api.get(`/finance/payments?month=${month}&year=${year}&all=true`);
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const inwardPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.type?.toLowerCase() !== "inward") return false;
      const matchesSearch =
        p.student?.studentNameEnglish
          ?.toLowerCase()
          ?.includes(inwardSearch.toLowerCase()) ||
        p.recipientName?.toLowerCase()?.includes(inwardSearch.toLowerCase()) ||
        inwardSearch === "";
      return matchesSearch;
    });
  }, [payments, inwardSearch]);

  const outwardPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.type?.toLowerCase() !== "outward") return false;
      const matchesSearch =
        p.recipientName?.toLowerCase()?.includes(outwardSearch.toLowerCase()) ||
        outwardSearch === "";
      return matchesSearch;
    });
  }, [payments, outwardSearch]);

  const totals = useMemo(() => {
    const revenue = payments
      .filter((p) => p.type === "inward" && p.status === "success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const expense = payments
      .filter((p) => p.type === "outward" && p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      revenue,
      expense,
      profit: revenue - expense,
    };
  }, [payments]);

  const [lifetimeStats, setLifetimeStats] = useState({ revenue: 0, expense: 0, profit: 0 });

  useEffect(() => {
    const fetchLifetime = async () => {
      try {
        const res = await api.get("/finance/payments?all=true");
        const allPayments = res.data.payments || [];
        const revenue = allPayments
          .filter((p) => p.type === "inward" && p.status === "success")
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        const expense = allPayments
          .filter((p) => p.type === "outward" && p.status === "paid")
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        setLifetimeStats({ revenue, expense, profit: revenue - expense });
      } catch (err) {
        console.error("Error fetching lifetime stats:", err);
      }
    };
    fetchLifetime();
  }, []);

  const exportToExcel = () => {
    const exportData = [...inwardPayments, ...outwardPayments].map((p, index) => ({
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
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Finance_Report_${selectedMonth}.xlsx`);
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


return (
  <div className="p-6 space-y-8 bg-slate-50 min-h-screen">

    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Finance Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage and track your school's financial health</p>
      </div>

      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <label className="text-sm font-semibold text-slate-600 ml-2">Filter Month:</label>
        <input
          type="month"
          className="border-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
        >
          Export Excel
        </button>
      </div>
    </div>

    {/* CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card
        title={`Revenue (${selectedMonth || 'Selected'})`}
        value={`₹ ${totals.revenue.toLocaleString("en-IN")}`}
        color="text-green-600"
        subtitle="Current selection"
      />
      <Card
        title={`Expense (${selectedMonth || 'Selected'})`}
        value={`₹ ${totals.expense.toLocaleString("en-IN")}`}
        color="text-red-600"
        subtitle="Current selection"
      />
      <Card
        title={`Profit (${selectedMonth || 'Selected'})`}
        value={`₹ ${totals.profit.toLocaleString("en-IN")}`}
        color="text-blue-600"
        subtitle="Current selection"
      />
      <Card
        title="Lifetime Profit"
        value={`₹ ${lifetimeStats.profit.toLocaleString("en-IN")}`}
        color="text-purple-600"
        subtitle="All time total"
      />
    </div>

    {/* ===================== INWARD SECTION ===================== */}

    <h2 className="text-2xl font-semibold">Inward Transactions</h2>

    <div className="flex flex-col md:flex-row justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 items-start md:items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search student or recipient..."
          className="w-full border border-slate-200 p-2 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          value={inwardSearch}
          onChange={(e) => setInwardSearch(e.target.value)}
        />
      </div>
      <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        Showing inward data for: <span className="text-slate-900 font-bold">{selectedMonth}</span>
      </div>
    </div>

    {/* INWARD TABLE */}
    <Table
      payments={inwardPayments}
      getStatusColor={getStatusColor}
      showCourse
      loading={loading}
    />

    {/* ===================== OUTWARD SECTION ===================== */}
    <h2 className="text-2xl font-semibold">Outward Transactions</h2>
    <div className="flex flex-col md:flex-row justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 items-start md:items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search recipient..."
          className="w-full border border-slate-200 p-2 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          value={outwardSearch}
          onChange={(e) => setOutwardSearch(e.target.value)}
        />
      </div>
      <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        Showing outward data for: <span className="text-slate-900 font-bold">{selectedMonth}</span>
      </div>
    </div>

    {/* OUTWARD TABLE */}
    <Table
      payments={outwardPayments}
      getStatusColor={getStatusColor}
      loading={loading}
    />

  </div>
);
};

////////////////////////////////////////////////////////////
// TABLE COMPONENT
////////////////////////////////////////////////////////////

const Table = ({ title, payments, getStatusColor, showCourse, loading }) => {
  const columns = [
    { name: 'S.No', selector: (row, index) => index + 1, width: '80px', center: true },
    { name: 'Name', selector: row => row.student?.studentNameEnglish || row.recipientName || row.student?.email || "N/A", sortable: true, cell: row => <span className="font-medium text-gray-800">{row.student?.studentNameEnglish || row.recipientName || row.student?.email || "N/A"}</span> },
  ];
  if (showCourse) {
    columns.push({ name: 'Course', selector: row => row.course?.title || "-", sortable: true, cell: row => <span className="text-gray-600">{row.course?.title || "-"}</span> });
  }
  columns.push(
    { name: 'Amount', selector: row => row.amount, sortable: true, cell: row => <span className="font-bold text-gray-800">₹ {row.amount?.toLocaleString("en-IN")}</span> },
    { name: 'Status', selector: row => row.status, sortable: true, center: true, 
      cell: row => (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
    { name: 'Date', selector: row => row.createdAt, sortable: true, cell: row => <span className="font-mono text-gray-600">{new Date(row.createdAt).toLocaleDateString("en-GB")}</span> }
  );

  return (
    <div className="mt-4">
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden pb-3">
        <CustomDataTable 
          columns={columns}
          data={payments}
          progressPending={loading}
          pagination
        />
      </div>
    </div>
  );
};

// CARD

const Card = ({ title, value, color, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
    <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    {subtitle && <p className="text-slate-400 text-[10px] mt-1 italic">{subtitle}</p>}
  </div>
);

export default Finance;