const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { protect, admin } = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit'); // ✅ PDF import

// ==============================
// ✅ Utility Function
// ==============================
const sumValues = (obj) =>
  obj ? Object.values(obj).reduce((a, b) => a + b, 0) : 0;


// ==============================
// ✅ GET ALL EMPLOYEE PAYROLL
// ==============================
router.get('/salary/all', protect, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month & year required" });
    }

    const employees = await Employee.find({ status: 'active' });

    const data = await Promise.all(
      employees.map(async (emp, index) => {
        const payroll = await Payroll.findOne({
          employee: emp._id,
          month: Number(month),
          year: Number(year),
        });

        const totalDays = new Date(year, month, 0).getDate();

        return {
          sNo: index + 1,
          employeeId: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,

          basicSalary: payroll ? payroll.basicSalary : emp.salary,

          allowances: payroll
            ? payroll.allowances
            : { hra: 0, medical: 0, bonus: 0 },

          totalAllowances: payroll
            ? payroll.totalAllowances
            : 0,

          deductions: payroll
            ? payroll.deductions
            : { pf: 0, tax: 0 },

          totalDeductions: payroll
            ? payroll.totalDeductions
            : 0,

          advance: payroll ? payroll.advance : 0,

          totalDays: payroll ? payroll.totalDays : totalDays,
          present: payroll ? payroll.present : 0,
          absent: payroll ? payroll.absent : 0,
          lateDays: payroll ? payroll.lateDays : 0,
          lateTime: payroll ? payroll.lateTime : 0,

          netSalary: payroll ? payroll.netSalary : emp.salary,

          _id: payroll ? payroll._id : null,
        };
      })
    );

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// ✅ CREATE / UPDATE PAYROLL
// ==============================
router.post('/', protect, async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      basicSalary = 0,
      allowances = {},
      deductions = {},
      advance = 0,
      present = 0,
      absent = 0,
      lateDays = 0,
      lateTime = 0,
      totalDays
    } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "Employee, month & year required" });
    }

    const numericMonth = Number(month);
    const numericYear = Number(year);

    const safeSum = (obj = {}) =>
      Object.values(obj).reduce((sum, val) => sum + Number(val || 0), 0);

    const totalAllowances = safeSum(allowances);
    const totalDeductions = safeSum(deductions);

    const calculatedTotalDays =
      totalDays || new Date(numericYear, numericMonth, 0).getDate();

    const netSalary =
      Number(basicSalary) +
      totalAllowances -
      totalDeductions -
      Number(advance);

    const payroll = await Payroll.findOneAndUpdate(
      { employee: employeeId, month: numericMonth, year: numericYear },
      {
        employee: employeeId,
        month: numericMonth,
        year: numericYear,
        basicSalary: Number(basicSalary),

        allowances,
        totalAllowances,

        deductions,
        totalDeductions,

        advance: Number(advance),

        totalDays: Number(calculatedTotalDays),
        present: Number(present),
        absent: Number(absent),
        lateDays: Number(lateDays),
        lateTime: Number(lateTime),

        netSalary
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      message: "Payroll saved successfully",
      payroll
    });

  } catch (err) {
    console.error("Payroll Save Error:", err);
    res.status(500).json({ message: err.message });
  }
});



// ==============================
// ✅ FINAL SINGLE PAGE PAYSLIP
// ==============================
router.get('/payslip/:id', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip_${payroll.employee.firstName}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    const formatCurrency = (val) =>
      `₹ ${Number(val || 0).toLocaleString("en-IN")}`;

    // Convert mongoose nested objects safely
    const allowances = payroll.allowances?.toObject
      ? payroll.allowances.toObject()
      : payroll.allowances || {};

    const deductions = payroll.deductions?.toObject
      ? payroll.deductions.toObject()
      : payroll.deductions || {};

    // =====================================================
    // HEADER
    // =====================================================
    doc.rect(0, 0, doc.page.width, 65).fill("#1F2937");

    doc.fillColor("#FFFFFF")
       .fontSize(18)
       .text("EDTECH PRIVATE LIMITED", 0, 22, { align: "center" });

    doc.fontSize(11)
       .text("Salary Payslip", 0, 42, { align: "center" });

    doc.y = 85;

    // =====================================================
    // EMPLOYEE DETAILS
    // =====================================================
    let y = doc.y;

    doc.fillColor("#000").fontSize(11);

    doc.text(
      `Employee Name : ${payroll.employee.firstName} ${payroll.employee.lastName}`,
      50,
      y
    );

    y += 18;

    doc.text(
      `Department : ${payroll.employee.department || "-"}`,
      50,
      y
    );

    y += 18;

    doc.text(
      `Month : ${payroll.month}/${payroll.year}`,
      50,
      y
    );

    y += 25;

    doc.moveTo(40, y)
       .lineTo(555, y)
       .strokeColor("#E5E7EB")
       .stroke();

    y += 20;

    // =====================================================
    // EARNINGS
    // =====================================================
    doc.fontSize(12).fillColor("#111827").text("EARNINGS", 50, y);
    y += 18;

    doc.fontSize(11).fillColor("#000");

    doc.text("Basic Salary", 60, y);
    doc.text(formatCurrency(payroll.basicSalary), 450, y, { align: "right" });
    y += 18;

    Object.entries(allowances).forEach(([key, value]) => {
      if (typeof value === "number" && value > 0) {
        doc.text(key.toUpperCase(), 60, y);
        doc.text(formatCurrency(value), 450, y, { align: "right" });
        y += 18;
      }
    });

    y += 10;

    // =====================================================
    // DEDUCTIONS
    // =====================================================
    doc.fontSize(12).fillColor("#111827").text("DEDUCTIONS", 50, y);
    y += 18;

    doc.fontSize(11).fillColor("#000");

    Object.entries(deductions).forEach(([key, value]) => {
      if (typeof value === "number" && value > 0) {
        doc.text(key.toUpperCase(), 60, y);
        doc.text(formatCurrency(value), 450, y, { align: "right" });
        y += 18;
      }
    });

    if (payroll.advance > 0) {
      doc.text("ADVANCE", 60, y);
      doc.text(formatCurrency(payroll.advance), 450, y, { align: "right" });
      y += 18;
    }

    y += 15;

    doc.moveTo(40, y)
       .lineTo(555, y)
       .strokeColor("#E5E7EB")
       .stroke();

    y += 20;

    // =====================================================
    // ATTENDANCE
    // =====================================================
    doc.fillColor("#111827")
       .fontSize(12)
       .text("Attendance", 50, y);

    y += 18;

    doc.fillColor("#000").fontSize(11);

    doc.text(`Total Days : ${payroll.totalDays}`, 60, y);
    y += 16;
    doc.text(`Present : ${payroll.present}`, 60, y);
    y += 16;
    doc.text(`Absent : ${payroll.absent}`, 60, y);
    y += 16;
    doc.text(`Late Days : ${payroll.lateDays}`, 60, y);

    y += 25;


    // =====================================================
    // NET SALARY
    // =====================================================
    doc.rect(40, y, 515, 40).fill("#16A34A");

    doc.fillColor("#FFFFFF")
       .fontSize(15)
       .text(
         `NET SALARY : ${formatCurrency(payroll.netSalary)}`,
         0,
         y + 12,
         { align: "center" }
       );

    y += 55;

    // =====================================================
    // FOOTER (NO PAGE BREAK)
    // =====================================================
    doc.fontSize(9)
       .fillColor("#6B7280")
       .text(
         "This is a computer-generated payslip.",
         0,
         y,
         { align: "center" }
       );

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;