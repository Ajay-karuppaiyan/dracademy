const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    images: [String],
    targetRoles: {
      type: [String], // ["student", "employee", "admin", "hr", "coach", "all"]
      required: true,
      index: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetUserName: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: String,
      role: String,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for fast role filtering
announcementSchema.index({ targetRoles: 1, createdAt: -1 });
announcementSchema.index({ targetUserId: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);