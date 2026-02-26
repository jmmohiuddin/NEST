const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyRegisteredEvents,
} = require('../controllers/eventController');

router.get('/my/registered', protect, getMyRegisteredEvents);

router.route('/')
  .get(getEvents)
  .post(protect, roleCheck('admin', 'mentor'), createEvent);

router.route('/:idOrSlug')
  .get(getEvent);

router.route('/:id')
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.route('/:id/register')
  .post(protect, registerForEvent)
  .delete(protect, cancelRegistration);

module.exports = router;
