const mongoose = require('mongoose');

const dayPlanSubSchema = new mongoose.Schema(
  {
    dayIndex: { type: Number, required: true, min: 0, max: 6, default: 0 },
    dayName: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: 'Monday'
    },
    title: { type: String, required: true, default: 'Workout Session' },
    workoutTitle: { type: String, default: 'Workout Session' },
    category: { type: String, default: 'Full Body' },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutProgram',
      default: null,
    },
    programSlug: { type: String, default: '' },
    isRestDay: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    keyLifts: [{ type: String }],
  },
  { _id: false }
);

// Sync title and workoutTitle, completed and isCompleted
dayPlanSubSchema.pre('validate', function (next) {
  if (this.title && !this.workoutTitle) this.workoutTitle = this.title;
  if (this.workoutTitle && !this.title) this.title = this.workoutTitle;
  if (this.completed !== undefined && this.isCompleted === undefined) this.isCompleted = this.completed;
  if (this.isCompleted !== undefined && this.completed === undefined) this.completed = this.isCompleted;
  next();
});

const weeklyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateName: {
      type: String,
      default: 'GOAT Hypertrophy Split (7-Day)',
    },
    weekStartDate: {
      type: Date,
      default: () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    days: [dayPlanSubSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

weeklyPlanSchema.virtual('completedCount').get(function () {
  return this.days ? this.days.filter((d) => d.completed || d.isCompleted).length : 0;
});

weeklyPlanSchema.virtual('adherencePercentage').get(function () {
  const count = this.days ? this.days.filter((d) => d.completed || d.isCompleted).length : 0;
  return Math.round((count / 7) * 100);
});

weeklyPlanSchema.virtual('adherencePercent').get(function () {
  const count = this.days ? this.days.filter((d) => d.completed || d.isCompleted).length : 0;
  return Math.round((count / 7) * 100);
});

module.exports = mongoose.model('WeeklyPlan', weeklyPlanSchema);
