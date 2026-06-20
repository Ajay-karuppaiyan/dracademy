const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const { protect } = require("../middleware/authMiddleware");

//////////////////////////////////////////////////////
// CREATE SUBJECT
//////////////////////////////////////////////////////
router.post("/", protect, async (req, res) => {
  try {
    const { name, code, type, semester } = req.body;

    const exists = await Subject.findOne({ $or: [{ name }, { code }] });
    if (exists) {
      return res.status(400).json({ message: "Subject with this name or code already exists" });
    }

    const subject = await Subject.create({ name, code, type, semester });

    res.status(201).json(subject);
  } catch (err) {
    console.error("SUBJECT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// GET ALL SUBJECTS
//////////////////////////////////////////////////////
router.get("/", protect, async (req, res) => {
  try {
    const subjects = await Subject.find().lean();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// UPDATE SUBJECT
//////////////////////////////////////////////////////
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, code, type, semester } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (name) subject.name = name;
    if (code) subject.code = code;
    if (type) subject.type = type;
    if (semester) subject.semester = semester;

    await subject.save();

    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// DELETE SUBJECT
//////////////////////////////////////////////////////
router.delete("/:id", protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.deleteOne();

    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
