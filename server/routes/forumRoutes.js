const express = require("express");
const ForumPost = require("../models/ForumPost");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require('../config/cloudinary');

const router = express.Router();


// ========================================
// CREATE POST
// ========================================
router.post("/", protect, upload.single("forumImage"), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await ForumPost.create({
      user: req.user._id,
      name: req.user.name,
      role: req.user.role,
      content: content.trim(),
      image: req.file ? req.file.path : null,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// GET POSTS (Pagination + Search)
// ========================================
router.get("/", protect, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = search
      ? { content: { $regex: search, $options: "i" } }
      : {};

    const total = await ForumPost.countDocuments(query);

    const posts = await ForumPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ========================================
// EDIT POST (Owner or Admin)
// ========================================
router.put("/:id", protect, async (req, res) => {
  try {
    const { content } = req.body;

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.content = content?.trim() || post.content;
    await post.save();

    res.json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ========================================
// LIKE / UNLIKE POST
// ========================================
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const index = post.likes.findIndex(id => id.toString() === userId);

    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ========================================
// ADD REPLY
// ========================================
router.post("/:id/reply", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ message: "Reply content required" });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.replies.push({
      user: req.user._id,
      name: req.user.name,
      role: req.user.role,
      content: content.trim(),
    });

    await post.save();
    res.json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ========================================
// DELETE REPLY (Owner or Admin)
// ========================================
router.delete("/:postId/reply/:replyId", protect, async (req, res) => {
  try {
    const { postId, replyId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const reply = post.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (
      reply.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reply.deleteOne();
    await post.save();

    res.json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ========================================
// DELETE POST (Owner or Admin)
// ========================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ========================================
// PIN / UNPIN POST (Admin Only)
// ========================================
router.put("/:id/pin", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only action" });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.isPinned = !post.isPinned;
    await post.save();

    res.json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;