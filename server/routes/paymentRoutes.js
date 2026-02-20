// const express = require("express");
// const crypto = require("crypto");
// const Razorpay = require("razorpay");
// const { protect } = require("../middleware/authMiddleware");
// const Course = require("../models/Course");
// const User = require("../models/User");

// const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


// // ================= CREATE ORDER =================
// router.post("/create-order", protect, async (req, res) => {
//   try {
//     const { courseId } = req.body;

//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const order = await razorpay.orders.create({
//       amount: course.price * 100,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     });

//     res.json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       courseId,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Order creation failed" });
//   }
// });


// // ================= VERIFY & ENROLL =================
// router.post("/verify-payment", protect, async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       courseId,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Payment verification failed" });
//     }

//     // ✅ Enroll user
//     const user = await User.findById(req.user._id);

//     if (!user.enrolledCourses.includes(courseId)) {
//       user.enrolledCourses.push(courseId);
//       await user.save();
//     }

//     res.json({ message: "Payment successful & enrolled" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Verification failed" });
//   }
// });

// module.exports = router;