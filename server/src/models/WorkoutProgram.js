const mongoose = require('mongoose');

const workoutExerciseSubSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    exerciseName: { type: String, required: true },
    order: { type: Number, default: 1 },
    sets: { type: Number, default: 4 },
    reps: { type: String, default: '8-12' },
    restSeconds: { type: Number, default: 60 },
    notes: { type: String },
  },
  { _id: false }
);

const workoutProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Chest', 'Back', 'Shoulder', 'Arms', 'Legs', 'Abs', 'Full Body', 'Home Workout'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 52,
    },
    equipment: [{ type: String }],
    targetMuscles: [{ type: String }],
    imageUrl: { type: String },
    warmup: { type: String, default: '5-10 mins dynamic stretching, shoulder dislocates, light cardio' },
    coolDown: { type: String, default: '5 mins static stretching, foam rolling, deep nasal breathing' },
    exercises: [workoutExerciseSubSchema],
    isFeatured: { type: Boolean, default: false },
    trainingObjective: { type: String, default: 'Hypertrophy & Strength' },
  },
  {
    timestamps: true,
  }
);

workoutProgramSchema.index({ category: 1, difficulty: 1 });
workoutProgramSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('WorkoutProgram', workoutProgramSchema);
