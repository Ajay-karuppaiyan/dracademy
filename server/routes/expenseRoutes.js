const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");
const Expense = require("../models/Expenses");

// ================== UPLOAD FOLDER ==================
const uploadPath = "uploads/receipts";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ================== MULTER CONFIG ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`);
  },
});
const upload = multer({ storage });

// ================== CREATE EXPENSE ==================
router.post("/", protect, upload.single("receipt"), async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;
    if (!title || amount == null || !category) {
      return res.status(400).json({ message: "Title, amount, and category are required" });
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category,
      description,
      date: date ? new Date(date) : Date.now(),
      receipt: req.file?.path,
      submittedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== GET ALL EXPENSES ==================
router.get("/", protect, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    let query = {};
    if (role !== "admin") query = { "submittedBy.userId": req.user._id };

    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== GET SINGLE EXPENSE ==================
router.get("/:id", protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Normal user can only view their own expenses
    if (req.user.role.toLowerCase() !== "admin" && expense.submittedBy.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this expense" });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== UPDATE EXPENSE ==================
router.put("/:id", protect, upload.single("receipt"), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Only admin or owner can update
    if (req.user.role.toLowerCase() !== "admin" && expense.submittedBy.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this expense" });
    }

    const { title, amount, category, description, date } = req.body;
    if (title) expense.title = title;
    if (amount != null) expense.amount = Number(amount);
    if (category) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date) expense.date = new Date(date);

    // Replace receipt if uploaded
    if (req.file) {
      if (expense.receipt && fs.existsSync(expense.receipt)) fs.unlinkSync(expense.receipt);
      expense.receipt = req.file.path;
    }

    await expense.save();
    res.json({ success: true, message: "Expense updated successfully", data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== DELETE EXPENSE ==================
router.delete("/:id", protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (req.user.role.toLowerCase() !== "admin" && expense.submittedBy.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }

    if (expense.receipt && fs.existsSync(expense.receipt)) fs.unlinkSync(expense.receipt);

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== APPROVE / REJECT EXPENSE ==================
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Only admin can approve/reject expenses" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    expense.status = status;
    expense.approvedBy = {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role,
    };

    await expense.save();
    res.json({ success: true, message: `Expense ${status} successfully`, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;