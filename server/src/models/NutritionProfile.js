const mongoose = require('mongoose');

const nutritionProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: { type: Number, required: true, min: 14, max: 110, default: 24 },
    gender: { type: String, default: 'male' },
    biologicalSex: { type: String, default: 'male' },
    heightCm: { type: Number, required: true, min: 100, max: 250, default: 175 },
    weightKg: { type: Number, required: true, min: 30, max: 300, default: 75 },
    activityLevel: {
      type: String,
      default: 'moderate',
    },
    goal: {
      type: String,
      default: 'gain',
    },
    bmr: { type: Number, default: 1700 },
    tdee: { type: Number, default: 2400 },
    targetCalories: { type: Number, default: 2400 },
    macros: {
      proteinPercent: { type: Number, default: 35 },
      carbPercent: { type: Number, default: 45 },
      fatPercent: { type: Number, default: 20 },
      proteinGrams: { type: Number, default: 210 },
      carbGrams: { type: Number, default: 270 },
      fatGrams: { type: Number, default: 53 },
    },
    macroSplit: {
      proteinPercent: { type: Number, default: 35 },
      carbsPercent: { type: Number, default: 45 },
      fatsPercent: { type: Number, default: 20 },
    },
    macroGrams: {
      protein: { type: Number, default: 210 },
      carbs: { type: Number, default: 270 },
      fats: { type: Number, default: 53 },
    },
    mealPacingAdvice: {
      type: String,
      default: 'Spread protein evenly across 3 to 4 meals to keep muscle protein synthesis elevated.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NutritionProfile', nutritionProfileSchema);
