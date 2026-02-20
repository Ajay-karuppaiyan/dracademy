const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { protect, admin } = require('../middleware/authMiddleware');

// Utility to sum object values
const sumValues = (obj) => (obj ? Object.values(obj).reduce((a, b) => a + b, 0) : 0);

// GET all employees with payroll info (defaults if payroll does not exist)
router.get('/salary/all', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: "Month & year required" });

    const employees = await Employee.find({ status: 'active' });
    const daysInMonth = new Date(year, month, 0).getDate(); // last day of month

const data = await Promise.all(
  employees.map(async (emp, index) => {
    const payroll = await Payroll.findOne({
      employee: emp._id,
      month: Number(month),
      year: Number(year),
    });

    return {
      sNo: index + 1,
      employeeId: emp._id,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,

      basicSalary: payroll ? payroll.basicSalary : emp.salary,

      allowances: payroll
        ? payroll.allowances
        : { hra: 0, medical: 0, bonus: 0 },

      totalAllowances: payroll ? payroll.totalAllowances : 0,

      deductions: payroll
        ? payroll.deductions
        : { pf: 0, tax: 0 },

      totalDeductions: payroll ? payroll.totalDeductions : 0,

      advance: payroll ? payroll.advance : 0,

      totalDays: payroll
        ? payroll.totalDays
        : new Date(year, month, 0).getDate(),

      present: payroll ? payroll.present : 0,
      absent: payroll ? payroll.absent : 0,
      lateDays: payroll ? payroll.lateDays : 0,
      lateTime: payroll ? payroll.lateTime : 0,

      netSalary: payroll
        ? payroll.netSalary
        : emp.salary,

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



// CREATE or UPDATE payroll
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

module.exports = router;
