const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const { protect } = require("../middleware/authMiddleware");

/* =====================================================
   MARK ALL AS READ
===================================================== */
router.patch("/mark-all", protect, async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();

    const query =
      role === "admin"
        ? {}
        : { targetRoles: { $in: [role, "all"] } };

    await Announcement.updateMany(
      {
        ...query,
        "readBy.userId": { $ne: req.user._id },
      },
      {
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date(),
          },
        },
      }
    );

    res.json({
      success: true,
      message: "All marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =====================================================
   UNREAD COUNT
===================================================== */
router.get("/unread/count", protect, async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();

    const query =
      role === "admin"
        ? {}
        : { targetRoles: { $in: [role, "all"] } };

    const unread = await Announcement.countDocuments({
      ...query,
      "readBy.userId": { $ne: req.user._id },
    });

    res.json({
      success: true,
      unread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =====================================================
   CREATE ANNOUNCEMENT
===================================================== */
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create announcements",
      });
    }

    const { title, message, targetRoles } = req.body;

    if (!title?.trim() || !message?.trim() || !targetRoles?.length) {
      return res.status(400).json({
        success: false,
        message: "Title, message and targetRoles are required",
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      targetRoles: targetRoles.map((r) => r.toLowerCase()),
      createdBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =====================================================
   GET ANNOUNCEMENTS
===================================================== */
router.get("/", protect, async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const query =
      role === "admin"
        ? {}
        : { targetRoles: { $in: [role, "all"] } };

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      page,
      total,
      pages: Math.ceil(total / limit),
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =====================================================
   MARK SINGLE AS READ
===================================================== */
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const alreadyRead = announcement.readBy.some(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        userId: req.user._id,
        readAt: new Date(),
      });
      await announcement.save();
    }

    res.json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =====================================================
   DELETE
===================================================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete",
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;