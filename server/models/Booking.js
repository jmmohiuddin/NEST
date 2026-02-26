const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['meeting_room', 'workspace', 'equipment', 'mentor_session', 'lab'],
    },
    resourceName: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number, // in minutes
      min: [15, 'Minimum duration is 15 minutes'],
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      givenAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ resourceType: 1, date: 1 });
bookingSchema.index({ mentor: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1, startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
