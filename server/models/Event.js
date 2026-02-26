const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: [
        'Workshop',
        'Hackathon',
        'Webinar',
        'Networking',
        'Pitch Competition',
        'Conference',
        'Bootcamp',
        'Meetup',
        'Demo Day',
        'Other',
      ],
    },
    category: {
      type: String,
      enum: [
        'Technology',
        'Business',
        'Marketing',
        'Design',
        'Finance',
        'Legal',
        'General',
      ],
      default: 'General',
    },
    coverImage: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
    },
    venue: {
      type: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        default: 'online',
      },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      meetingLink: { type: String, trim: true },
      platform: { type: String, trim: true },
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
    },
    registrations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        registeredAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['registered', 'attended', 'cancelled'],
          default: 'registered',
        },
      },
    ],
    speakers: [
      {
        name: { type: String, trim: true },
        title: { type: String, trim: true },
        bio: { type: String },
        avatar: { type: String },
        linkedin: { type: String },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    price: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isFree: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
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

// Virtuals
eventSchema.virtual('registrationCount').get(function () {
  return this.registrations ? this.registrations.length : 0;
});

eventSchema.virtual('isFull').get(function () {
  if (!this.capacity) return false;
  return this.registrations ? this.registrations.length >= this.capacity : false;
});

// Indexes
eventSchema.index({ slug: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ featured: -1, startDate: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Generate slug
eventSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
