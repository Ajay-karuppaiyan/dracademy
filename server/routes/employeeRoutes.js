const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Create new employee with documents
// @route   POST /api/employees
// @access  Private/Admin
router.post('/', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'idFile', maxCount: 1 },
    { name: 'certificateFile', maxCount: 1 },
    { name: 'contractFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dob,
            gender,
            employeeId,
            joiningDate,
            department,
            designation,
            role,
            employmentType,
            salary
        } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Create User account
        user = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: 'Employee@123', // Default password
            role: role || 'employee'
        });

        // 3. Prepare file data
        const getFileData = (fieldName) => {
            if (req.files && req.files[fieldName]) {
                const file = req.files[fieldName][0];
                return {
                    url: file.path,
                    public_id: file.filename,
                    name: file.originalname
                };
            }
            return null;
        };

        // 4. Create Employee Profile
        const employee = await Employee.create({
            user: user._id,
            firstName,
            lastName,
            phone,
            dob,
            gender,
            employeeId,
            joiningDate,
            department,
            designation,
            employmentType,
            salary,
            profilePic: getFileData('profilePic'),
            idFile: getFileData('idFile'),
            certificateFile: getFileData('certificateFile'),
            contractFile: getFileData('contractFile')
        });

        // 5. Link profile back to user
        user.employeeProfile = employee._id;
        await user.save();

        res.status(201).json({
            message: 'Employee created successfully',
            employee
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Get all employees
// @route   GET /api/employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find().populate('user', 'name email role');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
router.put('/:id', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'idFile', maxCount: 1 },
    { name: 'certificateFile', maxCount: 1 },
    { name: 'contractFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('user');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const updates = req.body;

        // Update User info if role changes
        if (updates.role && employee.user) {
            employee.user.role = updates.role;
            await employee.user.save();
        }

        // Handle file updates
        const updateFileData = (fieldName, existingFile) => {
            if (req.files && req.files[fieldName]) {
                const file = req.files[fieldName][0];
                return {
                    url: file.path,
                    public_id: file.filename,
                    name: file.originalname
                };
            }
            return existingFile;
        };

        // Update employee fields
        Object.keys(updates).forEach(key => {
            if (!['profilePic', 'idFile', 'certificateFile', 'contractFile', 'user'].includes(key)) {
                employee[key] = updates[key];
            }
        });

        employee.profilePic = updateFileData('profilePic', employee.profilePic);
        employee.idFile = updateFileData('idFile', employee.idFile);
        employee.certificateFile = updateFileData('certificateFile', employee.certificateFile);
        employee.contractFile = updateFileData('contractFile', employee.contractFile);

        await employee.save();

        res.json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle employee status (Block/Unblock)
// @route   PATCH /api/employees/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.status = employee.status === 'active' ? 'inactive' : 'active';
        await employee.save();

        res.json({
            message: `Employee ${employee.status === 'active' ? 'unblocked' : 'blocked'} successfully`,
            status: employee.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
