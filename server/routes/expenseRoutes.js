const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Expense = require("../models/Expenses");
const { protect } = require("../middleware/authMiddleware");

// ================= UPLOAD FOLDER =================
const uploadPath = "uploads/receipts";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, PDF allowed"));
    }
    cb(null, true);
  },
});


// =================================================
// ================ CREATE EXPENSE =================
// =================================================
router.post("/", protect, upload.single("receipt"), async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category,
      description,
      date: date ? new Date(date) : Date.now(),
      receipt: req.file?.path,
      submittedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================================
// ================ GET ALL EXPENSES ===============
// =================================================
router.get("/", protect, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();

    let query = {};
    if (role !== "admin") {
      query = { submittedBy: req.user._id };
    }

    const expenses = await Expense.find(query)
      .populate("submittedBy", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================================
// ================ APPROVE / REJECT ===============
// =================================================
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Not found" });

    expense.status = status;
    expense.approvedBy = req.user._id;
    expense.approvedAt = Date.now();

    await expense.save();

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================================
// ================ REIMBURSE ======================
// =================================================
router.patch("/:id/reimburse", protect, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { paymentMethod, transactionId } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Not found" });

    if (expense.status !== "approved") {
      return res.status(400).json({ message: "Must be approved first" });
    }

    expense.status = "reimbursed";
    expense.reimbursement.status = "paid";
    expense.reimbursement.paidAt = Date.now();
    expense.reimbursement.paymentMethod = paymentMethod;
    expense.reimbursement.transactionId = transactionId;

    await expense.save();

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================================
// ================ CATEGORY REPORT ================
// =================================================
router.get("/reports/category", protect, async (req, res) => {
  try {
    let match = {};
    if (req.user.role.toLowerCase() !== "admin") {
      match = { submittedBy: req.user._id };
    }

    const report = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================================
// ================ MONTHLY REPORT =================
// =================================================
router.get("/reports/monthly", protect, async (req, res) => {
  try {
    let match = {};
    if (req.user.role.toLowerCase() !== "admin") {
      match = { submittedBy: req.user._id };
    }

    const report = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================================
// ================ DASHBOARD SUMMARY ==============
// =================================================
router.get("/reports/summary", protect, async (req, res) => {
  try {
    let match = {};
    if (req.user.role.toLowerCase() !== "admin") {
      match = { submittedBy: req.user._id };
    }

    const summary = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;