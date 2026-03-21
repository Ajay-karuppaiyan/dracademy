const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { upload } = require('../config/cloudinary');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                role: 'student', // Default role for new Google logins
            });
        } else if (!user.googleId) {
            // Link existing account to Google
            user.googleId = googleId;
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            center: user.center,
            profilePic: user.profilePic,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error('GOOGLE LOGIN ERROR:', error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Check for 2FA
            if (user.isTwoFactorEnabled) {
                return res.json({
                    _id: user._id,
                    requiresTwoFactor: true,
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                center: user.center,
                profilePic: user.profilePic,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Validate 2FA token and login
// @route   POST /api/auth/2fa/validate
// @access  Public
router.post('/2fa/validate', async (req, res) => {
    const { userId, token } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret.base32,
            encoding: 'base32',
            token: token,
        });

        if (verified) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                center: user.center,
                profilePic: user.profilePic,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid 2FA code' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Setup 2FA (Generate Secret)
// @route   POST /api/auth/2fa/setup
// @access  Private
router.post('/2fa/setup', protect, async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({
            name: `DRRJ Academy (${req.user.email})`,
        });

        // Save secret to user but don't enable yet
        const user = await User.findById(req.user._id);
        user.twoFactorSecret = secret;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ message: 'Error generating QR code' });
            }
            res.json({ secret: secret.base32, qrCode: data_url });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Enable 2FA (Verify and Enable)
// @route   POST /api/auth/2fa/enable
// @access  Private
router.post('/2fa/enable', protect, async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findById(req.user._id);

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret.base32,
            encoding: 'base32',
            token: token,
        });

        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();
            res.json({ message: '2FA Enabled Successfully' });
        } else {
            res.status(400).json({ message: 'Invalid Code' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
router.post('/2fa/disable', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        res.json({ message: '2FA Disabled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("center", "name location");
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            center: user.center,
            profilePic: user.profilePic,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.mobile = req.body.mobile || user.mobile;
            user.email = req.body.email || user.email;

            if (req.file) {
                user.profilePic = {
                    url: req.file.path,
                    public_id: req.file.filename,
                    name: req.file.originalname,
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic,
                isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register a new user (student or parent)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, mobile, password, role, children } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user object safely
        const userData = {
            name,
            email,
            mobile,
            password,
            role: role || 'student',
        };

        // Only add children array if role is parent
        if (role === 'parent') {
            userData.children = Array.isArray(children) ? children : [];
        }

        const user = await User.create(userData);

        if (!user) {
            return res.status(400).json({ message: 'Invalid user data' });
        }

        // If parent and children provided, update students to link to this parent
        if (role === 'parent' && children && children.length > 0) {
            const Student = require('../models/Student');
            await Student.updateMany(
                { _id: { $in: children } },
                { $set: { parent: user._id } }
            );
        }

        // Return user info and token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            children: user.children || [],
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error('REGISTER ERROR:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register a new parent (Admin Only)
// @route   POST /api/auth/register-parent
// @access  Private (Admin)
router.post('/register-parent', protect, async (req, res) => {
    // Only Admin can create parents this way
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const { name, email, password, mobile, studentIds } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            mobile,
            password,
            role: 'parent',
            children: studentIds || []
        });

        if (user) {
            // Also update the Students to link back to this parent
            if (studentIds && studentIds.length > 0) {
                const Student = require('../models/Student'); // Import here to avoid circular dependency issues at top if any
                await Student.updateMany(
                    { _id: { $in: studentIds } },
                    { $set: { parent: user._id } }
                );
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                children: user.children
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
