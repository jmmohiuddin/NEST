const User = require('../models/User');
const Startup = require('../models/Startup');
const Mentor = require('../models/Mentor');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const FundingRequest = require('../models/FundingRequest');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

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

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  updateStartupStatus,
  updateMentorStatus,
  getPendingApprovals,
  getAnalytics,
};
