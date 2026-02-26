const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  // Check for time conflicts
  const conflict = await Booking.findOne({
    resourceType: req.body.resourceType,
    resourceName: req.body.resourceName,
    date: req.body.date,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        startTime: { $lte: req.body.startTime },
        endTime: { $gt: req.body.startTime },
      },
      {
        startTime: { $lt: req.body.endTime },
        endTime: { $gte: req.body.endTime },
      },
    ],
  });

  if (conflict) {
    return res.status(400).json({
      success: false,
      message: 'Time slot is already booked.',
    });
  }

  const booking = await Booking.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully.',
    data: booking,
  });
});

// @desc    Get all bookings (admin) or user's bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    resourceType,
    status,
    date,
    sort = '-date',
  } = req.query;

  const query = {};

  // Non-admin users can only see their own bookings
  if (req.user.role !== 'admin') {
    query.user = req.user._id;
  }

  if (resourceType) query.resourceType = resourceType;
  if (status) query.status = status;
  if (date) query.date = new Date(date);

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('user', 'firstName lastName avatar email')
      .populate('mentor')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: bookings,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'firstName lastName avatar email')
    .populate('mentor')
    .populate('participants', 'firstName lastName avatar');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.',
    });
  }

  // Check access
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.',
    });
  }

  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Booking updated.',
    data: booking,
  });
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.',
    });
  }

  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'User cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Booking cancelled.',
  });
});

// @desc    Submit feedback for booking
// @route   POST /api/bookings/:id/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.',
    });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  booking.feedback = {
    rating: req.body.rating,
    comment: req.body.comment,
    givenAt: new Date(),
  };

  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Feedback submitted.',
    data: booking,
  });
});

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  submitFeedback,
};
