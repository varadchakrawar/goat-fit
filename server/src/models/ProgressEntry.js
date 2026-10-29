const mongoose = require('mongoose');

const progressEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    weightKg: {
      type: Number,
      min: 30,
      max: 300,
    },
    benchPressPrKg: {
      type: Number,
      min: 0,
      max: 500,
    },
    squatPrKg: {
      type: Number,
      min: 0,
      max: 600,
    },
    deadliftPrKg: {
      type: Number,
      min: 0,
      max: 600,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

progressEntrySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ProgressEntry', progressEntrySchema);
