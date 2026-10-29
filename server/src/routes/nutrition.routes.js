const express = require('express');
const NutritionProfile = require('../models/NutritionProfile');
const { protect } = require('../middleware/auth');
const router = express.Router();

const calculateNutrition = (params) => {
  const { age, heightCm, weightKg, biologicalSex, activityLevel, goal, macroSplit } = params;

  // Mifflin-St Jeor Formula
  const sex = biologicalSex || params.gender || 'male';
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    heavy: 1.725,
    extra_active: 1.9,
    athlete: 1.9
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  if (goal === 'cut' || goal === 'lose') {
    targetCalories = Math.round(tdee - 500);
  } else if (goal === 'bulk' || goal === 'gain') {
    targetCalories = Math.round(tdee + 300);
  }

  // Ensure reasonable baseline floor
  if (targetCalories < 1200) targetCalories = 1200;

  // Macro percentages (default 35/45/20)
  const proteinPercent = macroSplit?.proteinPercent ?? 35;
  const carbsPercent = macroSplit?.carbsPercent ?? 45;
  const fatsPercent = macroSplit?.fatsPercent ?? 20;

  // Grams: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fats
  const proteinGrams = Math.round((targetCalories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((targetCalories * (carbsPercent / 100)) / 4);
  const fatsGrams = Math.round((targetCalories * (fatsPercent / 100)) / 9);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    macroSplit: { proteinPercent, carbsPercent, fatsPercent },
    macroGrams: {
      protein: proteinGrams,
      carbs: carbsGrams,
      fats: fatsGrams
    },
    smartRecommendation:
      'Spread protein evenly across 3 to 4 meals to keep muscle protein synthesis elevated throughout the day.'
  };
};

// @route   POST /api/nutrition/calculate
// @desc    Calculate TDEE and macros without saving (works for guest demo & preview)
// @access  Public
router.post('/calculate', (req, res) => {
  const { age, heightCm, weightKg, biologicalSex, activityLevel, goal, macroSplit } = req.body;

  if (!age || !heightCm || !weightKg) {
    return res.status(400).json({
      success: false,
      message: 'Please provide age, height (cm), and weight (kg).'
    });
  }

  const result = calculateNutrition({
    age: Number(age),
    heightCm: Number(heightCm),
    weightKg: Number(weightKg),
    biologicalSex: biologicalSex || 'male',
    activityLevel: activityLevel || 'moderate',
    goal: goal || 'maintain',
    macroSplit
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

// @route   GET /api/nutrition
// @desc    Get current user's saved nutrition profile
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let profile = await NutritionProfile.findOne({ user: req.user._id });

    if (!profile) {
      // Calculate from user's fitness profile
      const fit = req.user.fitnessProfile || {};
      const calculated = calculateNutrition({
        age: fit.age || 22,
        heightCm: fit.heightCm || 175,
        weightKg: fit.weightKg || 72,
        biologicalSex: fit.biologicalSex || 'male',
        activityLevel: fit.activityLevel || 'moderate',
        goal: fit.goal || 'maintain'
      });

      profile = await NutritionProfile.create({
        user: req.user._id,
        age: fit.age || 22,
        heightCm: fit.heightCm || 175,
        weightKg: fit.weightKg || 72,
        biologicalSex: fit.biologicalSex || 'male',
        activityLevel: fit.activityLevel || 'moderate',
        goal: fit.goal || 'maintain',
        ...calculated
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/nutrition
// @desc    Save/Update user's nutrition profile and target values
// @access  Private
router.put('/', protect, async (req, res, next) => {
  try {
    const { age, heightCm, weightKg, biologicalSex, activityLevel, goal, macroSplit } = req.body;

    // Validate macro total
    if (macroSplit) {
      const total = (macroSplit.proteinPercent || 0) + (macroSplit.carbsPercent || 0) + (macroSplit.fatsPercent || 0);
      if (total !== 100) {
        return res.status(400).json({
          success: false,
          message: `Macronutrient percentages must sum to exactly 100%. (Current total: ${total}%)`
        });
      }
    }

    const calculated = calculateNutrition({
      age: Number(age) || 22,
      heightCm: Number(heightCm) || 175,
      weightKg: Number(weightKg) || 72,
      biologicalSex: biologicalSex || 'male',
      activityLevel: activityLevel || 'moderate',
      goal: goal || 'maintain',
      macroSplit
    });

    let profile = await NutritionProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new NutritionProfile({ user: req.user._id });
    }

    profile.age = Number(age) || profile.age;
    profile.heightCm = Number(heightCm) || profile.heightCm;
    profile.weightKg = Number(weightKg) || profile.weightKg;
    profile.biologicalSex = biologicalSex || profile.biologicalSex;
    profile.activityLevel = activityLevel || profile.activityLevel;
    profile.goal = goal || profile.goal;
    profile.bmr = calculated.bmr;
    profile.tdee = calculated.tdee;
    profile.targetCalories = calculated.targetCalories;
    profile.macroSplit = calculated.macroSplit;
    profile.macroGrams = calculated.macroGrams;
    profile.smartRecommendation = calculated.smartRecommendation;

    await profile.save();

    // Also sync fitness profile in User model
    req.user.fitnessProfile.age = profile.age;
    req.user.fitnessProfile.heightCm = profile.heightCm;
    req.user.fitnessProfile.weightKg = profile.weightKg;
    req.user.fitnessProfile.biologicalSex = profile.biologicalSex;
    req.user.fitnessProfile.activityLevel = profile.activityLevel;
    req.user.fitnessProfile.goal = profile.goal;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Nutrition profile and targets updated successfully.',
      data: profile
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
