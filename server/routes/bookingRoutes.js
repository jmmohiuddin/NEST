const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

// Create booking
router.post('/', protect, asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  const conflict = await Booking.findOne({
    resourceType: req.body.resourceType,
    resourceName: req.body.resourceName,
    date: req.body.date,
    status: { $in: ['pending', 'confirmed'] },
    $or: [{ startTime: { $lt: req.body.endTime }, endTime: { $gt: req.body.startTime } }],
  });

  if (conflict) {
    return res.status(400).json({ success: false, message: 'Time slot is already booked.' });
  }

  const booking = await Booking.create(req.body);
  res.status(201).json({ success: true, message: 'Booking created.', data: booking });
}));

// Get user bookings
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, resourceType } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;
  if (resourceType) query.resourceType = resourceType;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query).populate('mentor').sort('-date').skip(skip).limit(parseInt(limit)).lean(),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: bookings,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
  });
}));

// Get single booking
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('mentor')
    .populate('participants', 'firstName lastName email');

  if (!booking) return res.status(404).json({ success: false, message: 'Not found.' });
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  res.status(200).json({ success: true, data: booking });
}));

// Cancel booking
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found.' });
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  await booking.save();

  res.status(200).json({ success: true, message: 'Booking cancelled.', data: booking });
}));

module.exports = router;
