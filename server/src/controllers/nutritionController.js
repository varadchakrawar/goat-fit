const NutritionProfile = require('../models/NutritionProfile');
const { calculateNutrition } = require('./authController');

// @desc    Calculate TDEE and macros (Public & Guest friendly)
// @route   POST /api/nutrition/calculate
const calculate = async (req, res, next) => {
  try {
    const { age, gender, heightCm, weightKg, activityLevel, goal, macroSplit } = req.body;

    if (!age || !heightCm || !weightKg) {
      return res.status(400).json({
        success: false,
        message: 'Age, height (cm), and weight (kg) are required.',
      });
    }

    if (macroSplit) {
      const sum = (macroSplit.proteinPercent || 0) + (macroSplit.carbPercent || 0) + (macroSplit.fatPercent || 0);
      if (Math.abs(sum - 100) > 0.5) {
        return res.status(400).json({
          success: false,
          message: `Macro percentages must sum to exactly 100%. Currently: ${sum}%`,
        });
      }
    }

    const result = calculateNutrition({
      age: Number(age),
      gender: gender || 'male',
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel: activityLevel || 'moderate',
      goal: goal || 'gain',
      macroSplit,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved nutrition profile
// @route   GET /api/nutrition/profile
const getNutritionProfile = async (req, res, next) => {
  try {
    let profile = await NutritionProfile.findOne({ user: req.user.id });

    if (!profile) {
      const result = calculateNutrition({
        age: req.user.profile?.age || 24,
        gender: req.user.profile?.gender || 'male',
        heightCm: req.user.profile?.heightCm || 175,
        weightKg: req.user.profile?.weightKg || 75,
        activityLevel: req.user.profile?.activityLevel || 'moderate',
        goal: req.user.profile?.fitnessGoal || 'gain',
      });
      profile = await NutritionProfile.create({
        user: req.user.id,
        age: req.user.profile?.age || 24,
        gender: req.user.profile?.gender || 'male',
        heightCm: req.user.profile?.heightCm || 175,
        weightKg: req.user.profile?.weightKg || 75,
        activityLevel: req.user.profile?.activityLevel || 'moderate',
        goal: req.user.profile?.fitnessGoal || 'gain',
        ...result,
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/update user's nutrition profile and targets
// @route   PUT /api/nutrition/profile
const saveNutritionProfile = async (req, res, next) => {
  try {
    const { age, gender, heightCm, weightKg, activityLevel, goal, macroSplit } = req.body;

    if (macroSplit) {
      const sum = (macroSplit.proteinPercent || 0) + (macroSplit.carbPercent || 0) + (macroSplit.fatPercent || 0);
      if (Math.abs(sum - 100) > 0.5) {
        return res.status(400).json({
          success: false,
          message: `Macro percentages must sum to 100%. Currently: ${sum}%`,
        });
      }
    }

    const calculated = calculateNutrition({
      age: Number(age || req.user.profile?.age || 24),
      gender: gender || req.user.profile?.gender || 'male',
      heightCm: Number(heightCm || req.user.profile?.heightCm || 175),
      weightKg: Number(weightKg || req.user.profile?.weightKg || 75),
      activityLevel: activityLevel || req.user.profile?.activityLevel || 'moderate',
      goal: goal || req.user.profile?.fitnessGoal || 'gain',
      macroSplit,
    });

    const profile = await NutritionProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          age: Number(age || req.user.profile?.age || 24),
          gender: gender || req.user.profile?.gender || 'male',
          heightCm: Number(heightCm || req.user.profile?.heightCm || 175),
          weightKg: Number(weightKg || req.user.profile?.weightKg || 75),
          activityLevel: activityLevel || req.user.profile?.activityLevel || 'moderate',
          goal: goal || req.user.profile?.fitnessGoal || 'gain',
          ...calculated,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Nutrition and macro targets saved successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculate,
  getNutritionProfile,
  saveNutritionProfile,
};
