const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit"); 
const toWords = require('number-to-words');

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
          adjustments: payroll && payroll.adjustments ? payroll.adjustments.map(a => ({
            type: a.type,
            amount: a.amount,
            note: a.note || "",
            createdAt: a.createdAt,
            _id: a._id
          })) : [],
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

// ==============================
// ✅ GENERATE PAYSLIP PDF
// ==============================
router.get('/payslip/:id', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');

    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    const emp = payroll.employee;
    const userId = emp.user; // To fetch attendance

    // Recalculate Attendance precisely since it is not saved to Payroll model continuously
    const m = payroll.month;
    const y = payroll.year;
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const totalDaysInMonth = endDate.getDate();

    let present = 0;
    let absent = 0;
    let lateDays = 0;
    let lateTimeDisplay = "0h 0m";

    if (userId) {
      const attendance = await Attendance.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      });
      present = attendance.length;

      const leaves = await Leave.find({
        userId: userId.toString(),
        status: "approved",
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      });
      absent = leaves.length;

      let shiftStart = emp.shift?.start || "09:30"; 
      if (shiftStart.split(":").length === 2) shiftStart += ":00";
      const shift = new Date(`1970-01-01T${shiftStart}`);

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
      lateTimeDisplay = `${lateHours}h ${lateMins}m`;
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Payslip_${emp.firstName}_${emp.lastName}_${m}_${y}.pdf`
    );
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // ===============================
    // COLORS & FONTS SETUP
    // ===============================
    const primaryColor = '#1e3a8a'; // Blue-900
    const secondaryColor = '#475569'; // Slate-600
    const accentColor = '#e2e8f0'; // Slate-200
    const textDark = '#0f172a';
    const textLight = '#64748b';
    
    // ===============================
    // HEADER (Company Info)
    // ===============================
    doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
    
    doc.fillColor('#ffffff')
       .fontSize(28).font('Helvetica-Bold')
       .text("DR ACADEMY", 50, 35);
       
    doc.fontSize(10).font('Helvetica')
       .opacity(0.8)
       .text("Official Employee Payslip", 50, 65)
       .opacity(1);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[m - 1];

    doc.fillColor('#ffffff')
       .fontSize(14).font('Helvetica-Bold')
       .text(`Payslip for ${monthName} ${y}`, doc.page.width - 250, 45, { align: 'right' });

    // ===============================
    // EMPLOYEE DETAILS SECTION
    // ===============================
    doc.moveDown(4);
    let topY = Math.max(doc.y, 120);

    // Box around employee details
    doc.rect(50, topY, doc.page.width - 100, 90)
       .lineWidth(1).strokeColor(accentColor).stroke();

    doc.fillColor(textDark)
       .fontSize(13).font('Helvetica-Bold')
       .text("Employee Information", 65, topY + 15);

    doc.fontSize(10).font('Helvetica').fillColor(textLight);
    
    // Left column info
    doc.text("Name:", 65, topY + 40)
       .text("Employee ID:", 65, topY + 60);

    // Right column info
    const midX = doc.page.width / 2;
    doc.text("Department:", midX, topY + 40)
       .text("Designation:", midX, topY + 60);

    // Values (Dark details)
    doc.fillColor(textDark).font('Helvetica-Bold');
    doc.text(`${emp.firstName} ${emp.lastName}`, 145, topY + 40)
       .text(emp.empId || payroll._id.toString().substring(0,8).toUpperCase(), 145, topY + 60)
       .text((emp.department || '-').toUpperCase(), midX + 80, topY + 40)
       .text((emp.position || '-').toUpperCase(), midX + 80, topY + 60);


    // ===============================
    // ATTENDANCE SUMMARY SECTION
    // ===============================
    topY += 110;
    doc.rect(50, topY, doc.page.width - 100, 65)
       .lineWidth(1).strokeColor(accentColor).stroke();

    doc.fillColor(textDark)
       .fontSize(11).font('Helvetica-Bold')
       .text("Attendance & Time Tracking", 65, topY + 10);
    
    doc.fontSize(9).font('Helvetica').fillColor(textLight);
    doc.text("Total Days:", 65, topY + 30)
       .text("Present:", 165, topY + 30)
       .text("Leaves/Absent:", 265, topY + 30)
       .text("Late Days:", 375, topY + 30)
       .text("Total Late Hrs:", 455, topY + 30);

    doc.fillColor(textDark).font('Helvetica-Bold');
    doc.text(totalDaysInMonth.toString(), 65, topY + 45)
       .text(present.toString(), 165, topY + 45)
       .text(absent.toString(), 265, topY + 45)
       .text(lateDays.toString(), 375, topY + 45)
       .text(lateTimeDisplay, 455, topY + 45);

    // ===============================
    // SALARY BREAKDOWN TABLE
    // ===============================
    topY += 95;

    // Table Header
    doc.rect(50, topY, doc.page.width - 100, 25).fill(accentColor);
    doc.fillColor(textDark).fontSize(10).font('Helvetica-Bold');
    doc.text("Earnings", 60, topY + 7, { width: 200 })
       .text("Amount (INR)", 210, topY + 7, { width: 80, align: 'right' })
       .text("Deductions", 310, topY + 7, { width: 150 })
       .text("Amount (INR)", 450, topY + 7, { width: 80, align: 'right' });

    let currentY = topY + 35;

    const earnings = [
      { name: 'Basic Salary', amount: payroll.basicSalary },
      { name: 'Allowances (Total)', amount: payroll.totalAllowances },
    ];

    const deductions = [
      { name: 'Deductions (Total)', amount: payroll.totalDeductions },
      { name: 'Advance Pay', amount: payroll.advance },
    ];

    // Filter adjustments out to show individual ones if preferred, but they are summarized in totals in Payroll Schema
    // We will show the generalized details here.

    doc.font('Helvetica').fontSize(10);
    const tableRows = Math.max(earnings.length, deductions.length);
    let totalEarning = 0;
    let totalDeduction = 0;

    for (let i = 0; i < tableRows; i++) {
      const e = earnings[i];
      const d = deductions[i];

      if (e) totalEarning += e.amount;
      if (d) totalDeduction += d.amount;

      // Ensure alternating colors if we had many rows, but we use lines here instead
      doc.fillColor(textDark);
      if (e) {
        doc.text(e.name, 60, currentY);
        doc.text(e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 210, currentY, { width: 80, align: 'right' });
      }
      if (d) {
        doc.text(d.name, 310, currentY);
        doc.text(d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, currentY, { width: 80, align: 'right' });
      }
      currentY += 20;
    }

    // Add a border below the items
    currentY += 5;
    doc.moveTo(50, currentY).lineTo(doc.page.width - 50, currentY).lineWidth(1).strokeColor(accentColor).stroke();

    // ===============================
    // TOTALS ROW
    // ===============================
    currentY += 10;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(textDark);
    doc.text("Gross Earnings", 60, currentY);
    doc.text(totalEarning.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 210, currentY, { width: 80, align: 'right' });
    
    doc.text("Total Deductions", 310, currentY);
    doc.text(totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, currentY, { width: 80, align: 'right' });

    // ===============================
    // NET PAY BLOCK
    // ===============================
    currentY += 40;
    
    doc.rect(doc.page.width - 250, currentY, 200, 35)
       .fill('#1e40af'); // blue-800
    
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
    doc.text("Net Salary :", doc.page.width - 240, currentY + 11);
    doc.text("₹ " + payroll.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 }), doc.page.width - 150, currentY + 11, { width: 90, align: 'right' });

    // Amount in words
    try {
      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Oblique');
      doc.text(`Amount in words: Rupees ${toWords.toWords(payroll.netSalary).replace(/-/g, ' ')} only.`, 50, currentY + 14);
    } catch (e) {
      // Ignore if number-to-words is not robust enough
    }

    // ===============================
    // FOOTER (Signatures & Notes)
    // ===============================
    currentY += 100;

    doc.moveTo(50, currentY).lineTo(200, currentY).strokeColor(secondaryColor).stroke();
    doc.moveTo(doc.page.width - 200, currentY).lineTo(doc.page.width - 50, currentY).stroke();

    currentY += 10;
    doc.fillColor(secondaryColor).fontSize(10).font('Helvetica');
    doc.text("Employer Signature", 50, currentY, { width: 150, align: 'center' });
    doc.text("Employee Signature", doc.page.width - 200, currentY, { width: 150, align: 'center' });

    doc.moveDown(4);
    doc.fontSize(8).fillColor('#94a3b8')
       .text("This is a computer-generated document. No signature is required for official purposes.", 0, doc.page.height - 50, { align: "center" });

    doc.end();

  } catch (err) {
    console.error("Payslip generation error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

