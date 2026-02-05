const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public (or semi-private)
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({});
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const departmentExists = await Department.findOne({ name });

        if (departmentExists) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = await Department.create({
            name,
            description,
            status
        });

        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (department) {
            department.name = req.body.name || department.name;
            department.description = req.body.description || department.description;
            department.status = req.body.status || department.status;

            const updatedDepartment = await department.save();
            res.json(updatedDepartment);
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (department) {
            await department.deleteOne();
            res.json({ message: 'Department removed' });
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
