const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  createStartup,
  getStartups,
  getStartup,
  updateStartup,
  deleteStartup,
  getMyStartup,
  getStartupStats,
} = require('../controllers/startupController');

router.get('/stats/overview', getStartupStats);
router.get('/my/startup', protect, getMyStartup);

router.route('/')
  .get(getStartups)
  .post(protect, roleCheck('startup_founder', 'admin'), createStartup);

router.route('/:idOrSlug')
  .get(getStartup);

router.route('/:id')
  .put(protect, updateStartup)
  .delete(protect, deleteStartup);

module.exports = router;
