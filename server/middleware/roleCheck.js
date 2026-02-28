// Role-based access control middleware
// superadmin always passes any role check that includes 'admin'
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Superadmin can access everything admin can (and more)
    if (req.user.role === 'superadmin' && allowedRoles.includes('admin')) {
      return next();
    }
    // Also allow explicit superadmin checks
    if (req.user.role === 'superadmin' && allowedRoles.includes('superadmin')) {
      return next();
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

// Check if user is superadmin only
const superadminOnly = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Superadmin only.',
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin/superadmin
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Admins and superadmins can access everything
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
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

module.exports = { roleCheck, ownerOrAdmin, superadminOnly };
