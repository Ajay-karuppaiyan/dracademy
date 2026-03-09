const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

//////////////////////////////////////////////////////
// CREATE EMPLOYEE
//////////////////////////////////////////////////////
router.post(
  "/",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "idFile", maxCount: 1 },
    { name: "certificateFile", maxCount: 1 },
    { name: "contractFile", maxCount: 1 },
  ]),
  async (req, res) => {
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
        salary,
        shiftStart,
        shiftEnd,
      } = req.body;

      //////////////////////////////////////////////////////
      // ROLE VALIDATION
      //////////////////////////////////////////////////////
      const roleLower = role ? role.toLowerCase() : "employee";

      const allowedRoles = [
        "student",
        "admin",
        "employee",
        "parent",
        "coach",
        "hr",
        "finance",
      ];

      if (!allowedRoles.includes(roleLower)) {
        return res.status(400).json({ message: "Invalid role selected" });
      }

      //////////////////////////////////////////////////////
      // CHECK USER EXIST
      //////////////////////////////////////////////////////
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      //////////////////////////////////////////////////////
      // CREATE USER
      //////////////////////////////////////////////////////
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password: "Employee@123",
        role: roleLower,
      });

      //////////////////////////////////////////////////////
      // CREATE EMPLOYEE
      //////////////////////////////////////////////////////
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

        salary:
          salary !== undefined && salary !== ""
            ? Number(salary)
            : undefined,

        // SHIFT OBJECT
        shift: {
          start: shiftStart,
          end: shiftEnd,
        },

        profilePic: req.files?.profilePic
          ? req.files.profilePic[0]
          : null,

        idFile: req.files?.idFile
          ? req.files.idFile[0]
          : null,

        certificateFile: req.files?.certificateFile
          ? req.files.certificateFile[0]
          : null,

        contractFile: req.files?.contractFile
          ? req.files.contractFile[0]
          : null,
      });

      user.employeeProfile = employee._id;
      await user.save();

      res.status(201).json({
        message: "Employee created successfully",
        employee,
      });
    } catch (err) {
      console.error("Error creating employee:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

//////////////////////////////////////////////////////
// GET ALL EMPLOYEES
//////////////////////////////////////////////////////
router.get("/", protect, async (req, res) => {
  try {
    const employees = await Employee.find().populate(
      "user",
      "name email role"
    );

    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// DELETE EMPLOYEE
//////////////////////////////////////////////////////
router.delete("/:id", protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await User.findByIdAndDelete(employee.user);
    await employee.deleteOne();

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////////////
// UPDATE EMPLOYEE
//////////////////////////////////////////////////////
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "idFile", maxCount: 1 },
    { name: "certificateFile", maxCount: 1 },
    { name: "contractFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

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
        salary,
        shiftStart,
        shiftEnd,
      } = req.body;

      //////////////////////////////////////////////////////
      // UPDATE USER
      //////////////////////////////////////////////////////
      const user = await User.findById(employee.user);

      if (!user) {
        return res.status(404).json({ message: "Associated user not found" });
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });

        if (emailExists) {
          return res.status(400).json({ message: "Email already exists" });
        }

        user.email = email;
      }

      if (firstName || lastName) {
        user.name = `${firstName || employee.firstName} ${
          lastName || employee.lastName
        }`;
      }

      // ROLE UPDATE
      if (role) {
        const roleLower = role.toLowerCase();

        const allowedRoles = [
          "student",
          "admin",
          "employee",
          "parent",
          "coach",
          "hr",
          "finance",
        ];

        if (!allowedRoles.includes(roleLower)) {
          return res.status(400).json({ message: "Invalid role selected" });
        }

        user.role = roleLower;
      }

      await user.save();

      //////////////////////////////////////////////////////
      // UPDATE EMPLOYEE DATA
      //////////////////////////////////////////////////////
      if (firstName) employee.firstName = firstName;
      if (lastName) employee.lastName = lastName;
      if (phone) employee.phone = phone;
      if (dob) employee.dob = dob;
      if (gender) employee.gender = gender;
      if (employeeId) employee.employeeId = employeeId;
      if (joiningDate) employee.joiningDate = joiningDate;
      if (department) employee.department = department;
      if (designation) employee.designation = designation;
      if (employmentType) employee.employmentType = employmentType;

      //////////////////////////////////////////////////////
      // SHIFT UPDATE
      //////////////////////////////////////////////////////
      if (shiftStart !== undefined || shiftEnd !== undefined) {
        if (!employee.shift) {
          employee.shift = {};
        }

        if (shiftStart) {
          employee.shift.start = shiftStart;
        }

        if (shiftEnd) {
          employee.shift.end = shiftEnd;
        }
      }

      //////////////////////////////////////////////////////
      // SALARY UPDATE
      //////////////////////////////////////////////////////
      if (salary !== undefined) {
        const parsedSalary = Number(salary);

        if (isNaN(parsedSalary) || parsedSalary < 0) {
          return res.status(400).json({ message: "Invalid salary value" });
        }

        employee.salary = parsedSalary;
      }

      //////////////////////////////////////////////////////
      // FILE UPDATE
      //////////////////////////////////////////////////////
      if (req.files) {
        if (req.files.profilePic)
          employee.profilePic = req.files.profilePic[0];

        if (req.files.idFile)
          employee.idFile = req.files.idFile[0];

        if (req.files.certificateFile)
          employee.certificateFile = req.files.certificateFile[0];

        if (req.files.contractFile)
          employee.contractFile = req.files.contractFile[0];
      }

      await employee.save();

      res.json({
        message: "Employee updated successfully",
        employee,
      });
    } catch (err) {
      console.error("Error updating employee:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;