const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const User = require('../models/User');

// Protect routes - verify JWT **or** Firebase ID token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    // ── Try Firebase ID-token verification first ──
    let user = null;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      // Look up user by the Firebase UID stored in our DB, or by email
      user = await User.findOne({
        $or: [
          { firebaseUid: decoded.uid },
          { email: decoded.email },
        ],
      }).select('-password -refreshToken');
    } catch {
      // Not a valid Firebase token — fall through to JWT
    }

    // ── Fallback to legacy JWT verification ──
    if (!user) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select('-password -refreshToken');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

// Optional auth - attach user if token exists, but don't block
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Try Firebase first
      let user = null;
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        user = await User.findOne({
          $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
        }).select('-password -refreshToken');
      } catch {
        // Not Firebase — try JWT
      }

      if (!user) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password -refreshToken');
      }

      req.user = user;
    } catch {
      // Token invalid, continue without user
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
