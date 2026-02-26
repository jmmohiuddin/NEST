const mongoose = require('mongoose');

const fundingRequestSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup is required'],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    amount: {
      requested: { type: Number, required: [true, 'Requested amount is required'], min: 0 },
      approved: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    fundingType: {
      type: String,
      required: [true, 'Funding type is required'],
      enum: ['Grant', 'Seed', 'Pre-Seed', 'Equity', 'Debt', 'Convertible Note'],
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      enum: ['Product Development', 'Marketing', 'Hiring', 'Operations', 'Research', 'Equipment', 'Other'],
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    milestones: [
      {
        title: { type: String },
        description: { type: String },
        targetDate: { type: Date },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending',
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed'],
      default: 'draft',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
fundingRequestSchema.index({ startup: 1 });
fundingRequestSchema.index({ requestedBy: 1 });
fundingRequestSchema.index({ status: 1 });
fundingRequestSchema.index({ fundingType: 1 });
fundingRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FundingRequest', fundingRequestSchema);
