const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    role: String,
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    role: String,
    content: { type: String, required: true },

    // ✅ NEW FIELD
    image: { type: String },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumPost", forumPostSchema);