const express = require("express");
const router = express.Router();
const Batch = require("../models/Batch");
const { protect } = require("../middleware/authMiddleware");

//////////////////////////////////////////////////////
// CREATE BATCH
//////////////////////////////////////////////////////
router.post("/", protect, async (req, res) => {
  try {
    const { name, certificateDate } = req.body;

    const exists = await Batch.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Batch already exists" });
    }

    const batch = await Batch.create({ name, certificateDate });

    res.status(201).json(batch);
  } catch (err) {
    console.error("BATCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// GET ALL BATCHES
//////////////////////////////////////////////////////
router.get("/", protect, async (req, res) => {
  try {
    const batches = await Batch.find().lean();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// UPDATE BATCH
//////////////////////////////////////////////////////
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, certificateDate } = req.body;

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (name) batch.name = name;
    if (certificateDate) batch.certificateDate = certificateDate;

    await batch.save();

    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// DELETE BATCH
//////////////////////////////////////////////////////
router.delete("/:id", protect, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await batch.deleteOne();

    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
