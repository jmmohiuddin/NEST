const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create event
// @route   POST /api/events
// @access  Private (admin, mentor)
const createEvent = asyncHandler(async (req, res) => {
  req.body.organizer = req.user._id;

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully.',
    data: event,
  });
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    type,
    category,
    status = 'published',
    upcoming,
    sort = 'startDate',
    featured,
  } = req.query;

  const query = { status };

  if (search) query.$text = { $search: search };
  if (type) query.type = type;
  if (category) query.category = category;
  if (featured === 'true') query.featured = true;
  if (upcoming === 'true') query.startDate = { $gte: new Date() };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Event.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: events,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @desc    Get single event
// @route   GET /api/events/:idOrSlug
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let event;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    event = await Event.findById(idOrSlug)
      .populate('organizer', 'firstName lastName avatar email')
      .populate('registrations.user', 'firstName lastName avatar');
  } else {
    event = await Event.findOne({ slug: idOrSlug })
      .populate('organizer', 'firstName lastName avatar email')
      .populate('registrations.user', 'firstName lastName avatar');
  }

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.',
    });
  }

  event.views += 1;
  await event.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (organizer or admin)
const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.',
    });
  }

  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  delete req.body.organizer;

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Event updated.',
    data: event,
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (organizer or admin)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.',
    });
  }

  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Event deleted.',
  });
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.',
    });
  }

  // Check if event is full
  if (event.capacity && event.registrations.length >= event.capacity) {
    return res.status(400).json({
      success: false,
      message: 'Event is full.',
    });
  }

  // Check registration deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return res.status(400).json({
      success: false,
      message: 'Registration deadline has passed.',
    });
  }

  // Check if already registered
  const alreadyRegistered = event.registrations.some(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyRegistered) {
    return res.status(400).json({
      success: false,
      message: 'Already registered for this event.',
    });
  }

  event.registrations.push({
    user: req.user._id,
    status: 'registered',
  });

  await event.save();

  res.status(200).json({
    success: true,
    message: 'Successfully registered for the event.',
  });
});

// @desc    Cancel event registration
// @route   DELETE /api/events/:id/register
// @access  Private
const cancelRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.',
    });
  }

  const regIndex = event.registrations.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (regIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'Not registered for this event.',
    });
  }

  event.registrations.splice(regIndex, 1);
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Registration cancelled.',
  });
});

// @desc    Get my events (registered)
// @route   GET /api/events/my/registered
// @access  Private
const getMyRegisteredEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    'registrations.user': req.user._id,
  })
    .populate('organizer', 'firstName lastName avatar')
    .sort('startDate')
    .lean();

  res.status(200).json({
    success: true,
    data: events,
  });
});

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyRegisteredEvents,
};
