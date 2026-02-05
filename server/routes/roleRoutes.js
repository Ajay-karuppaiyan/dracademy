const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const roles = await Role.find({});
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a role
// @route   POST /api/roles
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { name, description, permissions, status } = req.body;
        const roleExists = await Role.findOne({ name });

        if (roleExists) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = await Role.create({
            name,
            description,
            permissions,
            status
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (role) {
            role.name = req.body.name || role.name;
            role.description = req.body.description || role.description;
            role.permissions = req.body.permissions || role.permissions;
            role.status = req.body.status || role.status;

            const updatedRole = await role.save();
            res.json(updatedRole);
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (role) {
            await role.deleteOne();
            res.json({ message: 'Role removed' });
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
