const Mentor = require('../models/Mentor');
const Startup = require('../models/Startup');

/**
 * Intelligent Matchmaking Service
 * Matches startups with mentors based on industry, expertise, and needs
 */
class MatchmakingService {
  /**
   * Calculate match score between a startup and a mentor
   */
  static calculateMatchScore(startup, mentor) {
    let score = 0;
    const maxScore = 100;

    // Industry match (30 points)
    if (mentor.industries && mentor.industries.includes(startup.industry)) {
      score += 30;
    }

    // Skills/expertise alignment with startup tags (25 points)
    if (mentor.expertise && startup.tags) {
      const matchingSkills = mentor.expertise.filter((skill) =>
        startup.tags.some(
          (tag) => tag.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(tag.toLowerCase())
        )
      );
      const skillScore = Math.min((matchingSkills.length / Math.max(startup.tags.length, 1)) * 25, 25);
      score += skillScore;
    }

    // Specialization match with startup needs (20 points)
    if (mentor.specializations && startup.lookingFor) {
      const specMap = {
        'Fundraising': 'Funding',
        'Marketing': 'Customers',
        'HR': 'Talent',
        'Business Strategy': 'Partnerships',
      };

      const matchingSpecs = mentor.specializations.filter((spec) =>
        startup.lookingFor.some(
          (need) => specMap[spec] === need || spec.toLowerCase().includes(need.toLowerCase())
        )
      );
      score += Math.min((matchingSpecs.length / Math.max(startup.lookingFor.length, 1)) * 20, 20);
    }

    // Availability bonus (10 points)
    if (mentor.availability?.status === 'available') {
      score += 10;
    } else if (mentor.availability?.status === 'busy') {
      score += 3;
    }

    // Rating bonus (10 points)
    if (mentor.ratings?.average) {
      score += (mentor.ratings.average / 5) * 10;
    }

    // Mentee capacity bonus (5 points)
    const activeMentees = mentor.mentees?.filter((m) => m.status === 'active').length || 0;
    if (activeMentees < 3) {
      score += 5;
    }

    return Math.round(Math.min(score, maxScore));
  }

  /**
   * Find best mentor matches for a startup
   */
  static async findMentorMatches(startupId, limit = 10) {
    const startup = await Startup.findById(startupId).lean();
    if (!startup) throw new Error('Startup not found');

    const mentors = await Mentor.find({
      status: 'approved',
      isActive: true,
    })
      .populate('user', 'firstName lastName avatar bio organization')
      .lean();

    const matches = mentors
      .map((mentor) => ({
        mentor,
        score: this.calculateMatchScore(startup, mentor),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return matches;
  }

  /**
   * Find startup matches for a mentor
   */
  static async findStartupMatches(mentorId, limit = 10) {
    const mentor = await Mentor.findById(mentorId).lean();
    if (!mentor) throw new Error('Mentor not found');

    const startups = await Startup.find({
      status: 'approved',
      isActive: true,
    })
      .populate('founder', 'firstName lastName avatar')
      .lean();

    const matches = startups
      .map((startup) => ({
        startup,
        score: this.calculateMatchScore(startup, mentor),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return matches;
  }
}

module.exports = MatchmakingService;
