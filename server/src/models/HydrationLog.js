const mongoose = require('mongoose');

const hydrationActionSubSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    amountMl: { type: Number, required: true },
    action: { type: String, enum: ['add', 'remove', 'reset'], default: 'add' },
  },
  { _id: false }
);

const hydrationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateString: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
    dateKey: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    glasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    glassesLogged: {
      type: Number,
      default: 0,
      min: 0,
    },
    glassVolumeMl: {
      type: Number,
      default: 250,
    },
    totalMl: {
      type: Number,
      default: 0,
      min: 0,
    },
    goalMl: {
      type: Number,
      default: 2000,
    },
    dailyGoalMl: {
      type: Number,
      default: 2000,
    },
    history: [hydrationActionSubSchema],
    entries: [hydrationActionSubSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

hydrationLogSchema.pre('validate', function () {
  if (this.dateString && !this.dateKey) this.dateKey = this.dateString;
  if (this.dateKey && !this.dateString) this.dateString = this.dateKey;
  if (this.glasses !== undefined && this.glassesLogged === 0) this.glassesLogged = this.glasses;
  if (this.glassesLogged !== undefined && this.glasses === 0) this.glasses = this.glassesLogged;
  if (this.goalMl && !this.dailyGoalMl) this.dailyGoalMl = this.goalMl;
  if (this.dailyGoalMl && !this.goalMl) this.goalMl = this.dailyGoalMl;
  if (this.entries && this.entries.length > 0 && (!this.history || this.history.length === 0)) this.history = this.entries;
  if (this.history && this.history.length > 0 && (!this.entries || this.entries.length === 0)) this.entries = this.history;
});

hydrationLogSchema.virtual('percentage').get(function () {
  const goal = this.goalMl || this.dailyGoalMl || 2000;
  return Math.min(100, Math.round(((this.totalMl || 0) / goal) * 100));
});

hydrationLogSchema.virtual('remainingMl').get(function () {
  const goal = this.goalMl || this.dailyGoalMl || 2000;
  return Math.max(0, goal - (this.totalMl || 0));
});

module.exports = mongoose.model('HydrationLog', hydrationLogSchema);
