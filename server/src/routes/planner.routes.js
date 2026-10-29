const express = require('express');
const WeeklyPlan = require('../models/WeeklyPlan');
const WorkoutProgram = require('../models/WorkoutProgram');
const { protect } = require('../middleware/auth');
const router = express.Router();

const default7Day = [
  { dayIndex: 0, dayName: 'Monday', title: 'Chest Annihilation & Upper Pec Sculpt', workoutTitle: 'Chest Annihilation & Upper Pec Sculpt', category: 'Chest', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 1, dayName: 'Tuesday', title: 'V-Taper Lat Dominance & Deadlifts', workoutTitle: 'V-Taper Lat Dominance & Deadlifts', category: 'Back', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 2, dayName: 'Wednesday', title: 'Active Recovery & Mobility', workoutTitle: 'Active Recovery & Mobility', category: 'Full Body', isRestDay: true, completed: false, isCompleted: false },
  { dayIndex: 3, dayName: 'Thursday', title: '3D Boulder Shoulders & Traps', workoutTitle: '3D Boulder Shoulders & Traps', category: 'Shoulder', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 4, dayName: 'Friday', title: 'Guns Hypertrophy (Biceps & Triceps)', workoutTitle: 'Guns Hypertrophy (Biceps & Triceps)', category: 'Arms', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 5, dayName: 'Saturday', title: 'Quad Sweep & Hamstring Powerhouse', workoutTitle: 'Quad Sweep & Hamstring Powerhouse', category: 'Legs', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 6, dayName: 'Sunday', title: 'Rest / Recovery', workoutTitle: 'Rest / Recovery', category: 'Full Body', isRestDay: true, completed: false, isCompleted: false }
];

const alternate6Day = [
  { dayIndex: 0, dayName: 'Monday', title: 'Upper Body Power', workoutTitle: 'Upper Body Power', category: 'Full Body', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 1, dayName: 'Tuesday', title: 'Lower Body Hypertrophy', workoutTitle: 'Lower Body Hypertrophy', category: 'Legs', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 2, dayName: 'Wednesday', title: 'Active Recovery & Mobility', workoutTitle: 'Active Recovery & Mobility', category: 'Full Body', isRestDay: true, completed: false, isCompleted: false },
  { dayIndex: 3, dayName: 'Thursday', title: 'Push Hypertrophy', workoutTitle: 'Push Hypertrophy', category: 'Chest', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 4, dayName: 'Friday', title: 'Pull Hypertrophy', workoutTitle: 'Pull Hypertrophy', category: 'Back', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 5, dayName: 'Saturday', title: 'Legs & Core Sculpt', workoutTitle: 'Legs & Core Sculpt', category: 'Legs', isRestDay: false, completed: false, isCompleted: false },
  { dayIndex: 6, dayName: 'Sunday', title: 'Rest / Recovery', workoutTitle: 'Rest / Recovery', category: 'Full Body', isRestDay: true, completed: false, isCompleted: false }
];

// @route   GET /api/planner
// @desc    Get user's current weekly plan
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let plan = await WeeklyPlan.findOne({ user: req.user._id }).populate('days.program');

    if (!plan) {
      plan = await WeeklyPlan.create({
        user: req.user._id,
        templateName: 'GOAT Hypertrophy Split (7-Day)',
        days: default7Day
      });
      await plan.populate('days.program');
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/planner/day/:dayIndex
// @desc    Update a specific day's workout schedule
// @access  Private
router.put('/day/:dayIndex', protect, async (req, res, next) => {
  try {
    const dayIndex = parseInt(req.params.dayIndex, 10);
    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      return res.status(400).json({ success: false, message: 'Invalid day index. Must be 0 through 6.' });
    }

    let plan = await WeeklyPlan.findOne({ user: req.user._id });
    if (!plan) {
      plan = await WeeklyPlan.create({
        user: req.user._id,
        days: default7Day
      });
    }

    const { workoutTitle, title, category, programId, notes, isRestDay } = req.body;
    const targetTitle = workoutTitle || title;

    if (targetTitle !== undefined) {
      plan.days[dayIndex].workoutTitle = targetTitle;
      plan.days[dayIndex].title = targetTitle;
    }
    if (category !== undefined) plan.days[dayIndex].category = category;
    if (notes !== undefined) plan.days[dayIndex].notes = notes;
    if (isRestDay !== undefined) plan.days[dayIndex].isRestDay = isRestDay;
    if (programId !== undefined) {
      plan.days[dayIndex].program = programId || null;
    }

    await plan.save();
    await plan.populate('days.program');

    res.status(200).json({
      success: true,
      message: `Updated ${plan.days[dayIndex].dayName} plan.`,
      data: plan
    });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/planner/day/:dayIndex/toggle-complete
// @desc    Toggle day completed status
// @access  Private
router.patch('/day/:dayIndex/toggle-complete', protect, async (req, res, next) => {
  try {
    const dayIndex = parseInt(req.params.dayIndex, 10);
    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      return res.status(400).json({ success: false, message: 'Invalid day index.' });
    }

    let plan = await WeeklyPlan.findOne({ user: req.user._id });
    if (!plan) {
      plan = await WeeklyPlan.create({ user: req.user._id, days: default7Day });
    }

    const currentState = plan.days[dayIndex].completed || plan.days[dayIndex].isCompleted;
    plan.days[dayIndex].completed = !currentState;
    plan.days[dayIndex].isCompleted = !currentState;
    plan.days[dayIndex].completedAt = !currentState ? new Date() : null;

    await plan.save();
    await plan.populate('days.program');

    res.status(200).json({
      success: true,
      message: `${plan.days[dayIndex].dayName} marked as ${!currentState ? 'Completed' : 'Pending'}.`,
      data: plan
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/planner/reset & /api/planner/reset-week
// @desc    Reset all days in the current week to uncompleted
// @access  Private
router.post(['/reset', '/reset-week'], protect, async (req, res, next) => {
  try {
    let plan = await WeeklyPlan.findOne({ user: req.user._id });
    if (!plan) {
      plan = await WeeklyPlan.create({ user: req.user._id, days: default7Day });
    }

    plan.days.forEach((day) => {
      day.completed = false;
      day.isCompleted = false;
      day.completedAt = null;
    });

    await plan.save();
    await plan.populate('days.program');

    res.status(200).json({
      success: true,
      message: 'Weekly schedule adherence reset successfully.',
      data: plan
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/planner/template
// @desc    Apply template: 'default-7day' or 'six-day'
// @access  Private
router.post('/template', protect, async (req, res, next) => {
  try {
    const { template } = req.body;
    let targetDays = default7Day;
    let templateName = 'GOAT Hypertrophy Split (7-Day)';

    if (template === 'six-day') {
      targetDays = alternate6Day;
      templateName = 'Athletic Hypertrophy (6-Day Split)';
    }

    let plan = await WeeklyPlan.findOne({ user: req.user._id });
    if (!plan) {
      plan = new WeeklyPlan({ user: req.user._id });
    }

    plan.templateName = templateName;
    plan.days = targetDays.map((d) => ({
      ...d,
      completed: false,
      isCompleted: false,
      completedAt: null
    }));

    await plan.save();
    await plan.populate('days.program');

    res.status(200).json({
      success: true,
      message: `Applied ${templateName}.`,
      data: plan
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
