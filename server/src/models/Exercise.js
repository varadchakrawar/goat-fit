const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Chest', 'Back', 'Shoulder', 'Arms', 'Legs', 'Abs', 'Full Body', 'Home Workout'],
      required: true,
    },
    targetMuscles: [{ type: String, required: true }],
    secondaryMuscles: [{ type: String }],
    equipment: {
      type: String,
      enum: ['Barbell', 'Dumbbells', 'Cables', 'Machine', 'Bodyweight', 'Kettlebell', 'Bands', 'None'],
      default: 'Barbell',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    instructions: [{ type: String, required: true }],
    breathingCues: { type: String },
    movementCues: { type: String },
    commonMistakes: [{ type: String }],
    safetyNotes: { type: String },
    defaultSets: { type: Number, default: 4 },
    defaultReps: { type: String, default: '8-12' },
    defaultRestSeconds: { type: Number, default: 90 },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

exerciseSchema.index({ name: 'text', targetMuscles: 'text', equipment: 'text' });

module.exports = mongoose.model('Exercise', exerciseSchema);
