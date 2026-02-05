const express = require('express');
const router = express.Router();
const Designation = require('../models/Designation');

// @desc    Get all designations
// @route   GET /api/designations
// @access  Public
router.get('/', async (req, res) => {
    try {
        const designations = await Designation.find({});
        res.json(designations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a designation
// @route   POST /api/designations
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const designationExists = await Designation.findOne({ name });

        if (designationExists) {
            return res.status(400).json({ message: 'Designation already exists' });
        }

        const designation = await Designation.create({
            name,
            description,
            status
        });

        res.status(201).json(designation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a designation
// @route   PUT /api/designations/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        const designation = await Designation.findById(req.params.id);

        if (designation) {
            designation.name = req.body.name || designation.name;
            designation.description = req.body.description || designation.description;
            designation.status = req.body.status || designation.status;

            const updatedDesignation = await designation.save();
            res.json(updatedDesignation);
        } else {
            res.status(404).json({ message: 'Designation not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a designation
// @route   DELETE /api/designations/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const designation = await Designation.findById(req.params.id);

        if (designation) {
            await designation.deleteOne();
            res.json({ message: 'Designation removed' });
        } else {
            res.status(404).json({ message: 'Designation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
