const Mentor = require('../models/Mentor');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create mentor profile
// @route   POST /api/mentors
// @access  Private (mentor role)
const createMentorProfile = asyncHandler(async (req, res) => {
  // Check if mentor profile already exists
  const existing = await Mentor.findOne({ user: req.user._id });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Mentor profile already exists.',
    });
  }

  req.body.user = req.user._id;
  const mentor = await Mentor.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Mentor profile created. Pending admin approval.',
    data: mentor,
  });
});

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
const getMentors = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    expertise,
    industry,
    availability,
    specialization,
    sort = '-ratings.average',
    featured,
  } = req.query;

  const query = { status: 'approved', isActive: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (expertise) query.expertise = { $in: expertise.split(',') };
  if (industry) query.industries = { $in: industry.split(',') };
  if (availability) query['availability.status'] = availability;
  if (specialization) query.specializations = { $in: specialization.split(',') };
  if (featured === 'true') query.featured = true;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [mentors, total] = await Promise.all([
    Mentor.find(query)
      .populate('user', 'firstName lastName avatar email bio organization skills socialLinks')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Mentor.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: mentors,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
const getMentor = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id)
    .populate('user', 'firstName lastName avatar email bio organization skills socialLinks phone')
    .populate('mentees.startup', 'name logo industry stage');

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: mentor,
  });
});

// @desc    Update mentor profile
// @route   PUT /api/mentors/:id
// @access  Private
const updateMentorProfile = asyncHandler(async (req, res) => {
  let mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found.',
    });
  }

  if (mentor.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this profile.',
    });
  }

  delete req.body.user;
  delete req.body.status;

  mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('user', 'firstName lastName avatar email');

  res.status(200).json({
    success: true,
    message: 'Mentor profile updated.',
    data: mentor,
  });
});

// @desc    Get my mentor profile
// @route   GET /api/mentors/my/profile
// @access  Private
const getMyMentorProfile = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName avatar email bio')
    .populate('mentees.startup', 'name logo industry');

  res.status(200).json({
    success: true,
    data: mentor,
  });
});

// @desc    Rate a mentor
// @route   POST /api/mentors/:id/review
// @access  Private
const rateMentor = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5.',
    });
  }

  const mentor = await Mentor.findById(req.params.id);
  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found.',
    });
  }

  // Check if user already reviewed
  const existingReview = mentor.ratings.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    mentor.ratings.reviews.push({
      user: req.user._id,
      rating,
      comment,
    });
  }

  // Recalculate average
  const reviews = mentor.ratings.reviews;
  mentor.ratings.count = reviews.length;
  mentor.ratings.average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await mentor.save();

  res.status(200).json({
    success: true,
    message: 'Review submitted.',
    data: mentor.ratings,
  });
});

// @desc    Get mentor stats
// @route   GET /api/mentors/stats/overview
// @access  Public
const getMentorStats = asyncHandler(async (req, res) => {
  const [total, byExpertise, topRated] = await Promise.all([
    Mentor.countDocuments({ status: 'approved', isActive: true }),
    Mentor.aggregate([
      { $match: { status: 'approved', isActive: true } },
      { $unwind: '$specializations' },
      { $group: { _id: '$specializations', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Mentor.find({ status: 'approved', isActive: true })
      .sort('-ratings.average')
      .limit(5)
      .populate('user', 'firstName lastName avatar')
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: { total, byExpertise, topRated },
  });
});

module.exports = {
  createMentorProfile,
  getMentors,
  getMentor,
  updateMentorProfile,
  getMyMentorProfile,
  rateMentor,
  getMentorStats,
};
