const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Payment = require("../models/Payment");


// =======================================
// ✅ GET ALL PAYMENTS
// =======================================
router.get("/payments", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();

    const payments = await Payment.find()
      .populate("user", "name")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// =======================================
// ✅ GET PAYMENT BY ID
// =======================================
router.get("/payments/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email")
      .populate("course", "title");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// =======================================
// ✅ UPDATE PAYMENT (Status Update)
// =======================================
router.put("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// =======================================
// ✅ DELETE PAYMENT
// =======================================
router.delete("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    res.status(200).json({ message: "Payment Deleted Successfully" });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// =======================================
// ✅ TOTAL REVENUE SUMMARY
// =======================================
router.get("/summary/total-revenue", async (req, res) => {
  try {
    const result = await Payment.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(
      result[0] || { totalRevenue: 0, totalTransactions: 0 }
    );
  } catch (error) {
    console.error("Revenue Summary Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;