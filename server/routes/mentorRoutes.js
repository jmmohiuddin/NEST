const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  createMentorProfile,
  getMentors,
  getMentor,
  updateMentorProfile,
  getMyMentorProfile,
  rateMentor,
  getMentorStats,
} = require('../controllers/mentorController');

router.get('/stats/overview', getMentorStats);
router.get('/my/profile', protect, getMyMentorProfile);

router.route('/')
  .get(getMentors)
  .post(protect, roleCheck('mentor', 'admin'), createMentorProfile);

router.route('/:id')
  .get(getMentor)
  .put(protect, updateMentorProfile);

router.post('/:id/review', protect, rateMentor);

module.exports = router;
