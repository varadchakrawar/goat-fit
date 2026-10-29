const mongoose = require('mongoose');

const setLogSubSchema = new mongoose.Schema(
  {
    setNumber: { type: Number, required: true },
    reps: { type: Number, default: 10 },
    weightKg: { type: Number, default: 0 },
    completed: { type: Boolean, default: true },
  },
  { _id: false }
);

const sessionExerciseSubSchema = new mongoose.Schema(
  {
    exerciseId: { type: String, default: null },
    exerciseName: { type: String, required: true },
    sets: [setLogSubSchema],
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutProgram',
      default: null,
    },
    programName: {
      type: String,
      default: 'Workout Session',
    },
    workoutTitle: {
      type: String,
      default: 'Workout Session',
    },
    muscleGroup: {
      type: String,
      default: 'Full Body',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      default: 50,
    },
    totalVolumeKg: {
      type: Number,
      default: 0,
    },
    exercises: [sessionExerciseSubSchema],
    completedExercises: [sessionExerciseSubSchema],
    notes: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

workoutSessionSchema.pre('validate', function () {
  if (this.workoutTitle && !this.programName) this.programName = this.workoutTitle;
  if (this.programName && !this.workoutTitle) this.workoutTitle = this.programName;
  if (this.completedExercises && this.completedExercises.length > 0 && (!this.exercises || this.exercises.length === 0)) {
    this.exercises = this.completedExercises;
  }
  if (this.exercises && this.exercises.length > 0 && (!this.completedExercises || this.completedExercises.length === 0)) {
    this.completedExercises = this.exercises;
  }
});

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
