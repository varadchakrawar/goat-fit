const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const WeeklyPlan = require('../models/WeeklyPlan');
const NutritionProfile = require('../models/NutritionProfile');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'goat_fit_super_secret_jwt_key_sppu_wad_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: user.toSafeObject()
  });
};

// @route   POST /api/auth/register
// @desc    Register a new athlete
// @access  Public
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email address, and a password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match the password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Seed initial default WeeklyPlan for this user
    try {
      const defaultDays = [
        { dayIndex: 0, dayName: 'Monday', title: 'Chest Annihilation & Upper Pec Sculpt', workoutTitle: 'Chest Annihilation & Upper Pec Sculpt', category: 'Chest', isRestDay: false, completed: false },
        { dayIndex: 1, dayName: 'Tuesday', title: 'V-Taper Lat Dominance & Deadlifts', workoutTitle: 'V-Taper Lat Dominance & Deadlifts', category: 'Back', isRestDay: false, completed: false },
        { dayIndex: 2, dayName: 'Wednesday', title: 'Active Recovery & Mobility', workoutTitle: 'Active Recovery & Mobility', category: 'Full Body', isRestDay: true, completed: false },
        { dayIndex: 3, dayName: 'Thursday', title: '3D Boulder Shoulders & Traps', workoutTitle: '3D Boulder Shoulders & Traps', category: 'Shoulder', isRestDay: false, completed: false },
        { dayIndex: 4, dayName: 'Friday', title: 'Guns Hypertrophy (Biceps & Triceps)', workoutTitle: 'Guns Hypertrophy (Biceps & Triceps)', category: 'Arms', isRestDay: false, completed: false },
        { dayIndex: 5, dayName: 'Saturday', title: 'Quad Sweep & Hamstring Powerhouse', workoutTitle: 'Quad Sweep & Hamstring Powerhouse', category: 'Legs', isRestDay: false, completed: false },
        { dayIndex: 6, dayName: 'Sunday', title: 'Rest / Recovery', workoutTitle: 'Rest / Recovery', category: 'Full Body', isRestDay: true, completed: false }
      ];
      await WeeklyPlan.create({
        user: user._id,
        templateName: 'GOAT Hypertrophy Split (7-Day)',
        days: defaultDays
      });
    } catch (planErr) {
      console.warn('[Register] Default plan setup warning:', planErr.message);
    }

    // Seed default NutritionProfile for this user
    try {
      await NutritionProfile.create({
        user: user._id,
        age: 22,
        heightCm: 175,
        weightKg: 72,
        biologicalSex: 'male',
        activityLevel: 'moderate',
        goal: 'maintain',
        bmr: 1700,
        tdee: 2400,
        targetCalories: 2400,
        macroSplit: { proteinPercent: 35, carbsPercent: 45, fatsPercent: 20 },
        macroGrams: { protein: 210, carbs: 270, fats: 53 }
      });
    } catch (nutErr) {
      console.warn('[Register] Default nutrition setup warning:', nutErr.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate athlete and return token
// @access  Public
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/logout
// @desc    Clear session cookie
// @access  Public
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// @route   GET /api/auth/me
// @desc    Retrieve current authenticated user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject()
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile & fitness preferences
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, fitnessProfile } = req.body;

    if (name) req.user.name = name.trim();
    if (fitnessProfile) {
      req.user.fitnessProfile = {
        ...req.user.fitnessProfile.toObject(),
        ...fitnessProfile
      };
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
