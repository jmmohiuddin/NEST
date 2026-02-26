const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  updateStartupStatus,
  updateMentorStatus,
  getPendingApprovals,
  getAnalytics,
} = require('../controllers/adminController');

router.use(protect, roleCheck('admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/pending', getPendingApprovals);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser);

router.put('/startups/:id/status', updateStartupStatus);
router.put('/mentors/:id/status', updateMentorStatus);

module.exports = router;
