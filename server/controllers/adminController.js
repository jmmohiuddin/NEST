const User = require('../models/User');
const Startup = require('../models/Startup');
const Mentor = require('../models/Mentor');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const FundingRequest = require('../models/FundingRequest');
const Notification = require('../models/Notification');
const firebaseAdmin = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

// Superadmin email — the master owner
const SUPERADMIN_EMAIL = 'mohiuddinjomeddar@gmail.com';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStartups,
    pendingStartups,
    totalMentors,
    pendingMentors,
    totalEvents,
    upcomingEvents,
    totalBookings,
    totalFunding,
    recentUsers,
    usersByRole,
    startupsByMonth,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Startup.countDocuments({ status: 'approved' }),
    Startup.countDocuments({ status: 'pending' }),
    Mentor.countDocuments({ status: 'approved' }),
    Mentor.countDocuments({ status: 'pending' }),
    Event.countDocuments(),
    Event.countDocuments({ startDate: { $gte: new Date() }, status: 'published' }),
    Booking.countDocuments(),
    FundingRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount.approved' } } },
    ]),
    User.find().sort('-createdAt').limit(5).select('firstName lastName email role createdAt').lean(),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Startup.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: { total: totalUsers, byRole: usersByRole, recent: recentUsers },
      startups: { total: totalStartups, pending: pendingStartups, byMonth: startupsByMonth },
      mentors: { total: totalMentors, pending: pendingMentors },
      events: { total: totalEvents, upcoming: upcomingEvents },
      bookings: { total: totalBookings },
      funding: { totalApproved: totalFunding[0]?.total || 0 },
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, sort = '-createdAt' } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role, isVerified } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive, role, isVerified },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'User updated.',
    data: user,
  });
});

// @desc    Approve/reject startup
// @route   PUT /api/admin/startups/:id/status
// @access  Private (admin)
const updateStartupStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be approved, rejected, or suspended.',
    });
  }

  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('founder', 'firstName lastName email');

  if (!startup) {
    return res.status(404).json({ success: false, message: 'Startup not found.' });
  }

  // Create notification for founder
  await Notification.create({
    recipient: startup.founder._id,
    type: status === 'approved' ? 'startup_approved' : 'startup_rejected',
    title: `Startup ${status}`,
    message: `Your startup "${startup.name}" has been ${status}.`,
    link: `/dashboard/startup`,
  });

  res.status(200).json({
    success: true,
    message: `Startup ${status} successfully.`,
    data: startup,
  });
});

// @desc    Approve/reject mentor
// @route   PUT /api/admin/mentors/:id/status
// @access  Private (admin)
const updateMentorStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status.',
    });
  }

  const mentor = await Mentor.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor not found.' });
  }

  await Notification.create({
    recipient: mentor.user._id,
    type: status === 'approved' ? 'mentor_approved' : 'mentor_rejected',
    title: `Mentor application ${status}`,
    message: `Your mentor application has been ${status}.`,
    link: `/dashboard/mentor`,
  });

  res.status(200).json({
    success: true,
    message: `Mentor ${status} successfully.`,
    data: mentor,
  });
});

// @desc    Get pending approvals
// @route   GET /api/admin/pending
// @access  Private (admin)
const getPendingApprovals = asyncHandler(async (req, res) => {
  const [pendingStartups, pendingMentors, pendingFunding] = await Promise.all([
    Startup.find({ status: 'pending' })
      .populate('founder', 'firstName lastName email')
      .sort('-createdAt')
      .lean(),
    Mentor.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .lean(),
    FundingRequest.find({ status: 'submitted' })
      .populate('startup', 'name')
      .populate('requestedBy', 'firstName lastName')
      .sort('-createdAt')
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      startups: pendingStartups,
      mentors: pendingMentors,
      fundingRequests: pendingFunding,
    },
  });
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const [
    userGrowth,
    startupGrowth,
    eventActivity,
    industryDistribution,
    topStartups,
  ] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Startup.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Event.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRegistrations: { $sum: { $size: '$registrations' } },
        },
      },
    ]),
    Startup.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Startup.find({ status: 'approved' })
      .sort('-views')
      .limit(10)
      .select('name industry views stage')
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      userGrowth,
      startupGrowth,
      eventActivity,
      industryDistribution,
      topStartups,
    },
  });
});

// @desc    Get all events (admin view - includes all statuses)
// @route   GET /api/admin/events
// @access  Private (admin)
const getAdminEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, type, status, sort = '-createdAt' } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }
  if (type) query.type = type;
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Event.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: events,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) },
  });
});

// @desc    Get all startups (admin view - includes all statuses)
// @route   GET /api/admin/startups
// @access  Private (admin)
const getAdminStartups = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, industry, status, stage, sort = '-createdAt' } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }
  if (industry) query.industry = industry;
  if (status) query.status = status;
  if (stage) query.stage = stage;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [startups, total] = await Promise.all([
    Startup.find(query)
      .populate('founder', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Startup.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: startups,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) },
  });
});

// @desc    Toggle featured status for startup
// @route   PUT /api/admin/startups/:id/feature
// @access  Private (admin)
const toggleStartupFeatured = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) {
    return res.status(404).json({ success: false, message: 'Startup not found.' });
  }
  startup.featured = !startup.featured;
  await startup.save({ validateModifiedOnly: true });
  res.status(200).json({ success: true, message: `Startup ${startup.featured ? 'featured' : 'unfeatured'}.`, data: startup });
});

// @desc    Delete a startup
// @route   DELETE /api/admin/startups/:id
// @access  Private (admin)
const deleteStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) {
    return res.status(404).json({ success: false, message: 'Startup not found.' });
  }
  await startup.deleteOne();
  res.status(200).json({ success: true, message: 'Startup deleted.' });
});

// @desc    Get all mentors (admin view - includes all statuses)
// @route   GET /api/admin/mentors
// @access  Private (admin)
const getAdminMentors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, sort = '-createdAt' } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  let mentors = await Mentor.find(query)
    .populate('user', 'firstName lastName email avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  if (search) {
    const re = new RegExp(search, 'i');
    mentors = mentors.filter(m =>
      re.test(m.user?.firstName) || re.test(m.user?.lastName) || re.test(m.user?.email) || re.test(m.title)
    );
  }

  const total = await Mentor.countDocuments(query);
  res.status(200).json({
    success: true,
    data: mentors,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) },
  });
});

// @desc    Delete a mentor profile
// @route   DELETE /api/admin/mentors/:id
// @access  Private (admin)
const deleteMentor = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);
  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor not found.' });
  }
  await mentor.deleteOne();
  res.status(200).json({ success: true, message: 'Mentor profile deleted.' });
});

// @desc    Delete event (admin)
// @route   DELETE /api/admin/events/:id
// @access  Private (admin)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  await event.deleteOne();
  res.status(200).json({ success: true, message: 'Event deleted.' });
});

// @desc    Update event status (publish/unpublish/cancel)
// @route   PUT /api/admin/events/:id/status
// @access  Private (admin)
const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published', 'ongoing', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  res.status(200).json({ success: true, message: `Event ${status}.`, data: event });
});

// @desc    Toggle featured for event
// @route   PUT /api/admin/events/:id/feature
// @access  Private (admin)
const toggleEventFeatured = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  event.featured = !event.featured;
  await event.save({ validateModifiedOnly: true });
  res.status(200).json({ success: true, message: `Event ${event.featured ? 'featured' : 'unfeatured'}.`, data: event });
});

// @desc    Get all admins
// @route   GET /api/admin/roles
// @access  Private (superadmin)
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
    .select('firstName lastName email role avatar createdAt isActive')
    .sort('-createdAt')
    .lean();

  res.status(200).json({
    success: true,
    data: admins,
  });
});

// @desc    Assign admin role by email
// @route   POST /api/admin/roles/assign
// @access  Private (superadmin)
const assignAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Prevent assigning superadmin role
  if (normalizedEmail === SUPERADMIN_EMAIL) {
    return res.status(400).json({ success: false, message: 'This user is already the superadmin.' });
  }

  // Find user in our DB
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with this email. They must sign up first.',
    });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'User is already an admin.' });
  }

  // Update role in MongoDB
  user.role = 'admin';
  await user.save({ validateModifiedOnly: true });

  // Set Firebase custom claims if user has a Firebase UID
  if (user.firebaseUid) {
    try {
      await firebaseAdmin.auth().setCustomUserClaims(user.firebaseUid, {
        role: 'admin',
        isAdmin: true,
      });
    } catch (err) {
      console.warn('Could not set Firebase custom claims:', err.message);
    }
  }

  // Notify the user
  await Notification.create({
    recipient: user._id,
    type: 'system',
    title: 'Admin Access Granted',
    message: 'You have been granted admin access to NEST. You can now access the admin dashboard.',
    link: '/dashboard/admin',
  });

  res.status(200).json({
    success: true,
    message: `Admin access granted to ${user.firstName} ${user.lastName} (${normalizedEmail}).`,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Revoke admin role by userId
// @route   POST /api/admin/roles/revoke
// @access  Private (superadmin)
const revokeAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.role === 'superadmin') {
    return res.status(403).json({ success: false, message: 'Cannot revoke superadmin access.' });
  }

  if (user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'User is not an admin.' });
  }

  // Revert to student role
  user.role = 'student';
  await user.save({ validateModifiedOnly: true });

  // Remove Firebase custom claims
  if (user.firebaseUid) {
    try {
      await firebaseAdmin.auth().setCustomUserClaims(user.firebaseUid, {
        role: 'student',
        isAdmin: false,
      });
    } catch (err) {
      console.warn('Could not remove Firebase custom claims:', err.message);
    }
  }

  // Notify the user
  await Notification.create({
    recipient: user._id,
    type: 'system',
    title: 'Admin Access Revoked',
    message: 'Your admin access has been revoked.',
    link: '/dashboard',
  });

  res.status(200).json({
    success: true,
    message: `Admin access revoked from ${user.firstName} ${user.lastName}.`,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  updateStartupStatus,
  updateMentorStatus,
  getPendingApprovals,
  getAnalytics,
  getAdminEvents,
  deleteEvent,
  updateEventStatus,
  toggleEventFeatured,
  getAdminStartups,
  toggleStartupFeatured,
  deleteStartup,
  getAdminMentors,
  deleteMentor,
  getAdmins,
  assignAdmin,
  revokeAdmin,
  SUPERADMIN_EMAIL,
};
