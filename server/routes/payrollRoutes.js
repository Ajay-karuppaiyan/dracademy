const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");

// GET ALL PAYROLLS
router.get("/salary/all", protect, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month & year required" });
    }

    const m = Number(month);
    const y = Number(year);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const totalDaysInMonth = endDate.getDate();

    const employees = await Employee.find({ status: "active" });

    const data = await Promise.all(
      employees.map(async (emp, index) => {
        const userId = emp.user;

        if (!userId) {
          return {
            sNo: index + 1,
            employeeId: emp._id,
            name: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            basic: emp.salary,
            allowances: 0,
            deductions: 0,
            advance: 0,
            totalDays: totalDaysInMonth,
            present: 0,
            absent: 0,
            lateDays: 0,
            lateTime: "0h 0m",
            netSalary: emp.salary,
            _id: null
          };
        }

        // 1. Fetch Payroll Record (for adjustments)
        const payroll = await Payroll.findOne({
          employee: emp._id,
          month: m,
          year: y
        });

        // 2. Fetch Attendance Records
        const attendance = await Attendance.find({
          userId,
          date: { $gte: startDate, $lte: endDate }
        });

        const present = attendance.length;

        // 3. Fetch Approved Leaves
        const leaves = await Leave.find({
          userId: userId.toString(),
          status: "approved",
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        });

        const absent = leaves.length;

        // 4. Calculate Late Days/Time
        let shiftStart = emp.shift?.start || "09:30"; 
        // Ensure shift start is in HH:mm:ss format
        if (shiftStart.split(":").length === 2) shiftStart += ":00";
        
        const shift = new Date(`1970-01-01T${shiftStart}`);

        let lateDays = 0;
        let totalLateMinutes = 0;

        attendance.forEach((record) => {
          if (!record.loginTime) return;
          const login = new Date(`1970-01-01T${record.loginTime}`);
          if (login > shift) {
            lateDays++;
            const diffMinutes = Math.floor((login - shift) / (1000 * 60));
            totalLateMinutes += diffMinutes;
          }
        });

        const lateHours = Math.floor(totalLateMinutes / 60);
        const lateMins = totalLateMinutes % 60;
        const lateTimeDisplay = `${lateHours}h ${lateMins}m`;

        if (index < 2) {
          console.log(`[DEBUG] Emp: ${emp.firstName}, UserId: ${userId}`);
          console.log(`[DEBUG] Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);
          console.log(`[DEBUG] Attendance records found: ${attendance.length}`);
          console.log(`[DEBUG] Leaves found: ${leaves.length}`);
        }

        console.log(`Employee: ${emp.firstName}, UserId: ${userId}, Present: ${present}, Absent: ${absent}`);


        // 5. Calculate Salary
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
          userId: userId,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          basic,
          allowances,
          deductions,
          advance,
          totalDays: totalDaysInMonth,
          present,
          absent,
          lateDays,
          lateTime: lateTimeDisplay,
          netSalary,
          _id: payroll ? payroll._id : null
        };
      })
    );

    res.json(data);

  } catch (err) {
    console.error("Payroll GET error:", err);
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