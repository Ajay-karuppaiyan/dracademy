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

    targetRoles: {
      type: [String], // ["student", "employee", "admin"]
      required: true,
      index: true,
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

module.exports = mongoose.model("Announcement", announcementSchema);