const mongoose = require("mongoose");

const forumCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumComment",
      default: null, // for replies
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumComment", forumCommentSchema);