const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { protect } = require("../middleware/authMiddleware");

// GET ALL PAYROLLS
router.get("/salary/all", protect, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month & year required" });
    }

    const employees = await Employee.find({ status: "active" });

    const data = await Promise.all(
      employees.map(async (emp, index) => {

        const payroll = await Payroll.findOne({
          employee: emp._id,
          month: Number(month),
          year: Number(year)
        });

        const allowances = payroll ? payroll.totalAllowances : 0;
        const deductions = payroll ? payroll.totalDeductions : 0;
        const advance = payroll ? payroll.advance : 0;

        const basic = payroll && payroll.basicSalary
          ? payroll.basicSalary
          : emp.salary;

        const netSalary = basic + allowances - deductions - advance;

        return {
          sNo: index + 1,
          employeeId: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          basic,
          allowances,
          deductions,
          advance,
          netSalary,
          _id: payroll ? payroll._id : null
        };

      })
    );

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// CREATE / UPDATE PAYROLL ADJUSTMENT
router.post("/adjustment", protect, async (req, res) => {
  try {

    const { employeeId, month, year, type, amount, note } = req.body;

    if (!employeeId || !month || !year || !type || !amount) {
      return res.status(400).json({ message: "All fields required" });
    }

    let payroll = await Payroll.findOne({
      employee: employeeId,
      month: Number(month),
      year: Number(year)
    });

    // If payroll does not exist create it with employee salary
    if (!payroll) {

      const employee = await Employee.findById(employeeId);

      payroll = new Payroll({
        employee: employeeId,
        month: Number(month),
        year: Number(year),
        basicSalary: employee.salary,
        totalAllowances: 0,
        totalDeductions: 0,
        advance: 0,
        adjustments: []
      });

    }

    // Add adjustment
    payroll.adjustments.push({
      type,
      amount: Number(amount),
      note: note || ""
    });

    if (type === "allowance") payroll.totalAllowances += Number(amount);
    if (type === "deduction") payroll.totalDeductions += Number(amount);
    if (type === "advance") payroll.advance += Number(amount);

    payroll.netSalary =
      payroll.basicSalary +
      payroll.totalAllowances -
      payroll.totalDeductions -
      payroll.advance;

    await payroll.save();

    res.status(200).json({
      message: "Adjustment applied",
      payroll
    });

  } catch (err) {
    console.error("Payroll Adjustment Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;