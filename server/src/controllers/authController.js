const User = require('../models/User');
const WeeklyPlan = require('../models/WeeklyPlan');
const NutritionProfile = require('../models/NutritionProfile');
const HydrationLog = require('../models/HydrationLog');
const { generateToken } = require('../config/jwt');

// Helper to calculate BMR & TDEE using Mifflin-St Jeor
const calculateNutrition = ({ age, gender, heightCm, weightKg, activityLevel, goal, macroSplit }) => {
  // Mifflin-St Jeor Formula
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr;
  if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  bmr = Math.round(bmr);

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
    athlete: 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // Goal adjustment
  let calorieAdjustment = 0;
  if (goal === 'lose') calorieAdjustment = -500;
  if (goal === 'gain') calorieAdjustment = 300;

  const targetCalories = Math.max(1200, Math.round(tdee + calorieAdjustment));

  const pPct = macroSplit?.proteinPercent ?? 35;
  const cPct = macroSplit?.carbPercent ?? 45;
  const fPct = macroSplit?.fatPercent ?? 20;

  // Grams: 4 kcal per g protein & carb, 9 kcal per g fat
  const proteinGrams = Math.round((targetCalories * (pPct / 100)) / 4);
  const carbGrams = Math.round((targetCalories * (cPct / 100)) / 4);
  const fatGrams = Math.round((targetCalories * (fPct / 100)) / 9);

  return {
    bmr,
    tdee,
    targetCalories,
    macros: {
      proteinPercent: pPct,
      carbPercent: cPct,
      fatPercent: fPct,
      proteinGrams,
      carbGrams,
      fatGrams,
    },
    mealPacingAdvice: 'Spread protein evenly across 3 to 4 meals to keep muscle protein synthesis elevated.',
  };
};

// Default 7-day split template generator
const createDefault7DayPlan = (userId) => {
  return {
    user: userId,
    templateName: '7-Day GOAT Elite Split',
    days: [
      {
        dayIndex: 0,
        dayName: 'Monday',
        title: 'Chest Annihilation & Upper Pec Sculpt',
        category: 'Chest',
        programSlug: 'chest-annihilation',
        isRestDay: false,
        completed: false,
        keyLifts: ['Barbell Incline Bench Press', 'Flat Barbell Bench Press', 'Cable Pec Flyes'],
      },
      {
        dayIndex: 1,
        dayName: 'Tuesday',
        title: 'V-Taper Lat Dominance & Deadlifts',
        category: 'Back',
        programSlug: 'v-taper-lat-dominance',
        isRestDay: false,
        completed: false,
        keyLifts: ['Conventional Deadlift', 'Wide-Grip Lat Pulldown', 'Barbell Bent-Over Row'],
      },
      {
        dayIndex: 2,
        dayName: 'Wednesday',
        title: 'Active Recovery & Mobility',
        category: 'Full Body',
        programSlug: 'active-recovery-mobility',
        isRestDay: true,
        completed: false,
        keyLifts: ['Thoracic Spine Foam Rolling', 'Hamstring Flossing', 'Light Incline Walk'],
      },
      {
        dayIndex: 3,
        dayName: 'Thursday',
        title: '3D Boulder Shoulders & Traps',
        category: 'Shoulder',
        programSlug: 'boulder-shoulders-traps',
        isRestDay: false,
        completed: false,
        keyLifts: ['Overhead Barbell Military Press', 'Dumbbell Lateral Raises', 'Barbell Shrugs'],
      },
      {
        dayIndex: 4,
        dayName: 'Friday',
        title: 'Guns Hypertrophy (Biceps & Triceps)',
        category: 'Arms',
        programSlug: 'guns-hypertrophy',
        isRestDay: false,
        completed: false,
        keyLifts: ['EZ-Bar Preacher Curls', 'Close-Grip Bench Press', 'Cable Rope Tricep Pushdowns'],
      },
      {
        dayIndex: 5,
        dayName: 'Saturday',
        title: 'Quad Sweep & Hamstring Powerhouse',
        category: 'Legs',
        programSlug: 'quad-sweep-hamstrings',
        isRestDay: false,
        completed: false,
        keyLifts: ['Barbell Back Squat', 'Romanian Deadlift', 'Bulgarian Split Squat'],
      },
      {
        dayIndex: 6,
        dayName: 'Sunday',
        title: 'Rest / Recovery',
        category: 'Full Body',
        programSlug: 'rest-recovery',
        isRestDay: true,
        completed: false,
        keyLifts: ['Complete Rest', 'Nasal Diaphragmatic Breathing', 'Hydration Optimization'],
      },
    ],
  };
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken({ id: user._id, role: user.role, email: user.email });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('goatfit_token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, profile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      profile: profile || {},
    });

    // Create default weekly plan for the new user
    await WeeklyPlan.create(createDefault7DayPlan(user._id));

    // Create default nutrition profile
    const nutData = calculateNutrition({
      age: user.profile?.age || 24,
      gender: user.profile?.gender || 'male',
      heightCm: user.profile?.heightCm || 175,
      weightKg: user.profile?.weightKg || 75,
      activityLevel: user.profile?.activityLevel || 'moderate',
      goal: user.profile?.fitnessGoal || 'gain',
    });
    await NutritionProfile.create({ user: user._id, ...nutData });

    // Initialize today's hydration log
    const todayStr = new Date().toISOString().split('T')[0];
    await HydrationLog.create({
      user: user._id,
      dateString: todayStr,
      glasses: 0,
      totalMl: 0,
      goalMl: 2000,
      history: [],
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  res.cookie('goatfit_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & stats
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (profile) {
      user.profile = {
        ...user.profile.toObject(),
        ...profile,
      };
    }

    await user.save();

    // Recalculate nutrition targets if body stats changed
    const nutData = calculateNutrition({
      age: user.profile.age,
      gender: user.profile.gender,
      heightCm: user.profile.heightCm,
      weightKg: user.profile.weightKg,
      activityLevel: user.profile.activityLevel,
      goal: user.profile.fitnessGoal,
    });

    await NutritionProfile.findOneAndUpdate(
      { user: user._id },
      { $set: nutData },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  createDefault7DayPlan,
  calculateNutrition,
};
