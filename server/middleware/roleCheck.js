// Role-based access control middleware
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user ID matches
    const resourceUserId = req.resource?.[resourceUserField]?.toString();
    if (resourceUserId && resourceUserId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only manage your own resources.',
    });
  };
};

module.exports = { roleCheck, ownerOrAdmin };
