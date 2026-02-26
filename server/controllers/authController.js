const User = require('../models/User');
const admin = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists.',
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'student',
  });

  // Generate token
  const token = user.generateAuthToken();

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password.',
    });
  }

  // Find user with password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Contact admin.',
    });
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  // Generate token
  const token = user.generateAuthToken();

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

// @desc    Register user via Firebase (email/password or Google)
// @route   POST /api/auth/firebase-register
// @access  Public
const firebaseRegister = asyncHandler(async (req, res) => {
  const { idToken, firstName, lastName, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
  }

  // Verify the token with Firebase Admin
  const decoded = await admin.auth().verifyIdToken(idToken);

  // Check if user already exists
  let user = await User.findOne({
    $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
  });

  if (user) {
    // Link existing user to Firebase if not yet linked
    if (!user.firebaseUid) {
      user.firebaseUid = decoded.uid;
      user.authProvider = decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'firebase';
      await user.save({ validateModifiedOnly: true });
    }

    const token = user.generateAuthToken();
    return res.status(200).json({
      success: true,
      message: 'User already exists. Logged in.',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  }

  // Extract name from Firebase if not provided
  const nameParts = (decoded.name || '').split(' ');
  const fName = firstName || nameParts[0] || 'User';
  const lName = lastName || nameParts.slice(1).join(' ') || '';

  // Create new user
  user = await User.create({
    firstName: fName,
    lastName: lName,
    email: decoded.email,
    firebaseUid: decoded.uid,
    authProvider: decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'firebase',
    avatar: decoded.picture || '',
    role: role || 'student',
    isVerified: decoded.email_verified || false,
  });

  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

// @desc    Login / upsert user via Firebase ID token
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
  }

  const decoded = await admin.auth().verifyIdToken(idToken);

  // Find or create user
  let user = await User.findOne({
    $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
  });

  if (user) {
    // Link Firebase UID if missing
    if (!user.firebaseUid) {
      user.firebaseUid = decoded.uid;
      user.authProvider = decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'firebase';
    }
    // Update avatar from Google if not set
    if (!user.avatar && decoded.picture) {
      user.avatar = decoded.picture;
    }
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });
  } else {
    // Auto-create user (Google sign-in first time via login page)
    const nameParts = (decoded.name || '').split(' ');
    user = await User.create({
      firstName: nameParts[0] || 'User',
      lastName: nameParts.slice(1).join(' ') || '',
      email: decoded.email,
      firebaseUid: decoded.uid,
      authProvider: decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'firebase',
      avatar: decoded.picture || '',
      role: role || 'student',
      isVerified: decoded.email_verified || false,
      lastLogin: new Date(),
    });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
  }

  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'bio', 'organization',
    'skills', 'interests', 'socialLinks', 'avatar',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: user,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password.',
    });
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect.',
    });
  }

  user.password = newPassword;
  await user.save();

  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
    data: { token },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = {
  register,
  login,
  firebaseRegister,
  firebaseLogin,
  getMe,
  updateProfile,
  changePassword,
  logout,
};
