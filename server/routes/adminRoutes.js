const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck, superadminOnly } = require('../middleware/roleCheck');
const {
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
} = require('../controllers/adminController');

// All admin routes require auth + admin (or superadmin) role
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

// ── Events Management ──
router.get('/events', getAdminEvents);
router.delete('/events/:id', deleteEvent);
router.put('/events/:id/status', updateEventStatus);
router.put('/events/:id/feature', toggleEventFeatured);

// ── Startups Management ──
router.get('/startups', getAdminStartups);
router.put('/startups/:id/feature', toggleStartupFeatured);
router.delete('/startups/:id', deleteStartup);

// ── Mentors Management ──
router.get('/mentors', getAdminMentors);
router.delete('/mentors/:id', deleteMentor);

// ── Role Management Routes (superadmin only) ──
router.get('/roles', superadminOnly(), getAdmins);
router.post('/roles/assign', superadminOnly(), assignAdmin);
router.post('/roles/revoke', superadminOnly(), revokeAdmin);

module.exports = router;
