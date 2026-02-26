const Startup = require('../models/Startup');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create startup
// @route   POST /api/startups
// @access  Private (startup_founder, admin)
const createStartup = asyncHandler(async (req, res) => {
  req.body.founder = req.user._id;

  // Check if user already has a startup
  const existing = await Startup.findOne({ founder: req.user._id });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'You already have a registered startup. Edit your existing one.',
    });
  }

  const startup = await Startup.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Startup created successfully. Pending admin approval.',
    data: startup,
  });
});

// @desc    Get all startups (with filters)
// @route   GET /api/startups
// @access  Public
const getStartups = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    industry,
    stage,
    location,
    lookingFor,
    sort = '-createdAt',
    featured,
  } = req.query;

  const query = { status: 'approved', isActive: true };

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (industry) query.industry = industry;
  if (stage) query.stage = stage;
  if (location) query['location.city'] = new RegExp(location, 'i');
  if (lookingFor) query.lookingFor = { $in: lookingFor.split(',') };
  if (featured === 'true') query.featured = true;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [startups, total] = await Promise.all([
    Startup.find(query)
      .populate('founder', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Startup.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: startups,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @desc    Get single startup
// @route   GET /api/startups/:idOrSlug
// @access  Public
const getStartup = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let startup;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    startup = await Startup.findById(idOrSlug)
      .populate('founder', 'firstName lastName avatar email bio socialLinks')
      .populate('mentors');
  } else {
    startup = await Startup.findOne({ slug: idOrSlug })
      .populate('founder', 'firstName lastName avatar email bio socialLinks')
      .populate('mentors');
  }

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found.',
    });
  }

  // Increment views
  startup.views += 1;
  await startup.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    data: startup,
  });
});

// @desc    Update startup
// @route   PUT /api/startups/:id
// @access  Private (founder or admin)
const updateStartup = asyncHandler(async (req, res) => {
  let startup = await Startup.findById(req.params.id);

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found.',
    });
  }

  // Check ownership
  if (startup.founder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this startup.',
    });
  }

  // Don't allow changing founder or status through this endpoint
  delete req.body.founder;
  delete req.body.status;

  startup = await Startup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('founder', 'firstName lastName avatar');

  res.status(200).json({
    success: true,
    message: 'Startup updated successfully.',
    data: startup,
  });
});

// @desc    Delete startup
// @route   DELETE /api/startups/:id
// @access  Private (founder or admin)
const deleteStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found.',
    });
  }

  if (startup.founder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this startup.',
    });
  }

  await startup.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Startup deleted successfully.',
  });
});

// @desc    Get my startup
// @route   GET /api/startups/my/startup
// @access  Private
const getMyStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id })
    .populate('founder', 'firstName lastName avatar email')
    .populate('mentors');

  res.status(200).json({
    success: true,
    data: startup,
  });
});

// @desc    Get startup statistics
// @route   GET /api/startups/stats/overview
// @access  Public
const getStartupStats = asyncHandler(async (req, res) => {
  const [totalApproved, byIndustry, byStage] = await Promise.all([
    Startup.countDocuments({ status: 'approved', isActive: true }),
    Startup.aggregate([
      { $match: { status: 'approved', isActive: true } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Startup.aggregate([
      { $match: { status: 'approved', isActive: true } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalApproved,
      byIndustry,
      byStage,
    },
  });
});

module.exports = {
  createStartup,
  getStartups,
  getStartup,
  updateStartup,
  deleteStartup,
  getMyStartup,
  getStartupStats,
};
