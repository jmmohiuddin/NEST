const mongoose = require('mongoose');
const slugify = require('slugify');

const startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Startup name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder is required'],
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
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
    stage: {
      type: String,
      required: [true, 'Stage is required'],
      enum: ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'],
    },
    foundedDate: {
      type: Date,
    },
    teamSize: {
      type: Number,
      min: [1, 'Team size must be at least 1'],
      default: 1,
    },
    teamMembers: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true },
        avatar: { type: String },
        linkedin: { type: String },
      },
    ],
    website: {
      type: String,
      trim: true,
    },
    socialLinks: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },
    funding: {
      totalRaised: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      rounds: [
        {
          type: { type: String, enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Grant'] },
          amount: Number,
          date: Date,
          investors: [String],
        },
      ],
    },
    metrics: {
      revenue: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
      growth: { type: Number, default: 0 },
    },
    lookingFor: [
      {
        type: String,
        enum: ['Co-Founder', 'Mentor', 'Funding', 'Talent', 'Partnerships', 'Customers'],
      },
    ],
    mentors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
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
    views: {
      type: Number,
      default: 0,
    },
    pitchDeck: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
startupSchema.index({ slug: 1 });
startupSchema.index({ industry: 1 });
startupSchema.index({ stage: 1 });
startupSchema.index({ status: 1 });
startupSchema.index({ founder: 1 });
startupSchema.index({ tags: 1 });
startupSchema.index({ 'location.city': 1 });
startupSchema.index({ featured: -1, createdAt: -1 });
startupSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Generate slug before saving
startupSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Startup', startupSchema);
