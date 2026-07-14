const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email or password missing
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email }).populate('department', 'name');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if status is Inactive
    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: user._id,
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      profilePic: user.profilePic,
      department: user.department,
      designation: user.designation,
      joiningDate: user.joiningDate,
      status: user.status,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new user (Admin Only)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res) => {
  const {
    fullName,
    email,
    mobileNumber,
    department,
    designation,
    joiningDate,
    salary,
    address,
    status,
    role,
    password
  } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      mobileNumber,
      department: department || undefined,
      designation,
      joiningDate: joiningDate || undefined,
      salary: salary || 0,
      address,
      status: status || 'Active',
      role,
      password
    });

    // Save user
    const savedUser = await user.save();

    // Create notification
    await Notification.create({
      user: savedUser._id,
      type: 'Employee Added',
      message: `Welcome ${savedUser.fullName}! Your profile has been created successfully with role ${savedUser.role}.`
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: savedUser._id,
        employeeId: savedUser.employeeId,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile (Self edit profile)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Editable fields by user themselves
    user.fullName = req.body.fullName || user.fullName;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
    user.address = req.body.address || user.address;

    // Handle Profile Pic if uploaded
    if (req.file) {
      // Save static URL route
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic !== undefined) {
      user.profilePic = req.body.profilePic;
    }

    const updatedUser = await user.save();
    const populatedUser = await User.findById(updatedUser._id)
      .select('-password')
      .populate('department', 'name');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: populatedUser
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Provide current password and new password' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword
};
