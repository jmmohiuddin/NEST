const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    industries: [
      {
        type: String,
        enum: [
          'Technology',
          'Healthcare',
          'Education',
          'Finance',
          'Agriculture',
          'E-Commerce',
          'SaaS',
          'AI/ML',
          'IoT',
          'CleanTech',
          'FoodTech',
          'Social Impact',
          'Other',
        ],
      },
    ],
    experience: {
      years: { type: Number, min: 0, default: 0 },
      description: { type: String, maxlength: 2000 },
    },
    company: {
      name: { type: String, trim: true },
      position: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    availability: {
      status: {
        type: String,
        enum: ['available', 'busy', 'unavailable'],
        default: 'available',
      },
      hoursPerWeek: { type: Number, min: 0, max: 40, default: 5 },
      preferredDays: [
        {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
      ],
      preferredTime: {
        start: { type: String },
        end: { type: String },
      },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },
    mentees: [
      {
        startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
        startedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['active', 'completed', 'paused'],
          default: 'active',
        },
      },
    ],
    ratings: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
      reviews: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          rating: { type: Number, min: 1, max: 5 },
          comment: { type: String, maxlength: 500 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    sessionCount: {
      type: Number,
      default: 0,
    },
    specializations: [
      {
        type: String,
        enum: [
          'Business Strategy',
          'Product Development',
          'Marketing',
          'Sales',
          'Fundraising',
          'Technology',
          'Operations',
          'Legal',
          'Finance',
          'HR',
          'Design',
          'Growth Hacking',
        ],
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    matchScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
mentorSchema.index({ user: 1 });
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ industries: 1 });
mentorSchema.index({ 'availability.status': 1 });
mentorSchema.index({ status: 1 });
mentorSchema.index({ featured: -1 });
mentorSchema.index({ 'ratings.average': -1 });
mentorSchema.index({ expertise: 'text', specializations: 'text' });

module.exports = mongoose.model('Mentor', mentorSchema);
