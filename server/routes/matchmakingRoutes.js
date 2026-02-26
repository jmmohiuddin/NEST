const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const MatchmakingService = require('../services/matchmakingService');
const { asyncHandler } = require('../middleware/errorHandler');

// Get mentor matches for a startup
router.get('/mentors-for-startup/:startupId', protect, asyncHandler(async (req, res) => {
  const matches = await MatchmakingService.findMentorMatches(req.params.startupId);
  res.status(200).json({ success: true, data: matches });
}));

// Get startup matches for a mentor
router.get('/startups-for-mentor/:mentorId', protect, asyncHandler(async (req, res) => {
  const matches = await MatchmakingService.findStartupMatches(req.params.mentorId);
  res.status(200).json({ success: true, data: matches });
}));

module.exports = router;
