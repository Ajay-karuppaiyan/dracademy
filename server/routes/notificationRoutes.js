const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

// Get logged-in user's notifications
router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// Mark one as read
router.patch("/:id/read", protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
  });

  res.json({ message: "Marked as read" });
});

// Mark all as read
router.patch("/mark-all", protect, async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: "All marked as read" });
});

module.exports = router;