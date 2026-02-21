const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");

const { protect } = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");

// 🔐 Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/////////////////////////////////////////////////////////////
// 1️⃣ CREATE ORDER
/////////////////////////////////////////////////////////////
router.post("/create-order", protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const user = await User.findById(req.user._id);

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // ✅ Convert rupees → paise for Razorpay
    const amountInPaise = course.price * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // ✅ Store rupees in DB (not paise)
    await Payment.create({
      user: user._id,
      course: course._id,
      userName: user.name,
      amount: course.price, // store ₹1000 (not 100000)
      currency: order.currency,
      razorpayOrderId: order.id,
      receipt: order.receipt,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: order.amount, // paise (needed for frontend)
      currency: order.currency,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order creation failed" });
  }
});

/////////////////////////////////////////////////////////////
// 2️⃣ VERIFY PAYMENT
/////////////////////////////////////////////////////////////
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const paymentDetails = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentMethod = paymentDetails.method;
    payment.status = "success";
    payment.rawResponse = paymentDetails;

    await payment.save();

    const user = await User.findById(req.user._id);

    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    res.json({ message: "Payment verified & enrolled successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
});

/////////////////////////////////////////////////////////////
// 3️⃣ WEBHOOK (Industry Must-Have)
/////////////////////////////////////////////////////////////
router.post("/webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const paymentId = event.payload.payment.entity.id;

      await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        { status: "success" }
      );
    }

    if (event.event === "payment.failed") {
      const paymentId = event.payload.payment.entity.id;

      await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        { status: "failed" }
      );
    }

    res.json({ status: "Webhook received" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Webhook error" });
  }
});

module.exports = router;