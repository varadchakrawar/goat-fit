const WeeklyPlan = require('../models/WeeklyPlan');
const WorkoutProgram = require('../models/WorkoutProgram');
const { createDefault7DayPlan } = require('./authController');

const get6DayTemplate = (userId) => {
  return {
    user: userId,
    templateName: '6-Day Hypertrophy & Power Split',
    days: [
      {
        dayIndex: 0,
        dayName: 'Monday',
        title: 'Upper Body Power',
        category: 'Full Body',
        programSlug: 'upper-body-power',
        isRestDay: false,
        completed: false,
        keyLifts: ['Heavy Barbell Bench', 'Weighted Pull-ups', 'Overhead Military Press'],
      },
      {
        dayIndex: 1,
        dayName: 'Tuesday',
        title: 'Lower Body Hypertrophy',
        category: 'Legs',
        programSlug: 'lower-body-hypertrophy',
        isRestDay: false,
        completed: false,
        keyLifts: ['Front Squats', 'Romanian Deadlifts', 'Walking Lunges'],
      },
      {
        dayIndex: 2,
        dayName: 'Wednesday',
        title: 'Active Recovery & Mobility',
        category: 'Full Body',
        programSlug: 'active-recovery-mobility',
        isRestDay: true,
        completed: false,
        keyLifts: ['Light Walk', 'Foam Rolling', 'Dynamic Hip Openers'],
      },
      {
        dayIndex: 3,
        dayName: 'Thursday',
        title: 'Push Hypertrophy',
        category: 'Chest',
        programSlug: 'push-hypertrophy',
        isRestDay: false,
        completed: false,
        keyLifts: ['Incline Dumbbell Press', 'Dumbbell Lateral Raises', 'Tricep Dips'],
      },
      {
        dayIndex: 4,
        dayName: 'Friday',
        title: 'Pull Hypertrophy',
        category: 'Back',
        programSlug: 'pull-hypertrophy',
        isRestDay: false,
        completed: false,
        keyLifts: ['Chest-Supported Rows', 'Lat Pulldowns', 'Incline Bicep Curls'],
      },
      {
        dayIndex: 5,
        dayName: 'Saturday',
        title: 'Legs & Core Sculpt',
        category: 'Legs',
        programSlug: 'legs-core-sculpt',
        isRestDay: false,
        completed: false,
        keyLifts: ['Leg Press', 'Hamstring Curls', 'Hanging Leg Raises'],
      },
      {
        dayIndex: 6,
        dayName: 'Sunday',
        title: 'Rest & Complete Recovery',
        category: 'Full Body',
        programSlug: 'rest-recovery',
        isRestDay: true,
        completed: false,
        keyLifts: ['Rest', 'Nasal Breathing', 'Hydration Focus'],
      },
    ],
  };
};

// @desc    Get user's weekly training split
// @route   GET /api/planner
const getWeeklyPlan = async (req, res, next) => {
  try {
    let plan = await WeeklyPlan.findOne({ user: req.user.id }).populate('days.program');

    if (!plan) {
      plan = await WeeklyPlan.create(createDefault7DayPlan(req.user.id));
      plan = await WeeklyPlan.findById(plan._id).populate('days.program');
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update specific day in the plan
// @route   PUT /api/planner/day/:dayIndex
const updateDayPlan = async (req, res, next) => {
  try {
    const dayIndex = parseInt(req.params.dayIndex);
    const { title, category, programId, programSlug, isRestDay, notes, keyLifts } = req.body;

    let plan = await WeeklyPlan.findOne({ user: req.user.id });
    if (!plan) {
      plan = await WeeklyPlan.create(createDefault7DayPlan(req.user.id));
    }

    const dayObj = plan.days.find((d) => d.dayIndex === dayIndex);
    if (!dayObj) {
      return res.status(404).json({ success: false, message: 'Day not found in schedule.' });
    }

    if (title !== undefined) dayObj.title = title;
    if (category !== undefined) dayObj.category = category;
    if (programId !== undefined) dayObj.program = programId || null;
    if (programSlug !== undefined) dayObj.programSlug = programSlug || '';
    if (isRestDay !== undefined) dayObj.isRestDay = isRestDay;
    if (notes !== undefined) dayObj.notes = notes;
    if (keyLifts !== undefined) dayObj.keyLifts = keyLifts;

    await plan.save();

    const updated = await WeeklyPlan.findById(plan._id).populate('days.program');

    res.status(200).json({
      success: true,
      message: 'Day plan updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle day completed status
// @route   PATCH /api/planner/day/:dayIndex/toggle-complete
const toggleDayComplete = async (req, res, next) => {
  try {
    const dayIndex = parseInt(req.params.dayIndex);
    let plan = await WeeklyPlan.findOne({ user: req.user.id });
    if (!plan) {
      plan = await WeeklyPlan.create(createDefault7DayPlan(req.user.id));
    }

    const dayObj = plan.days.find((d) => d.dayIndex === dayIndex);
    if (!dayObj) {
      return res.status(404).json({ success: false, message: 'Day not found in schedule.' });
    }

    dayObj.completed = !dayObj.completed;
    dayObj.completedAt = dayObj.completed ? new Date() : null;

    await plan.save();

    const updated = await WeeklyPlan.findById(plan._id).populate('days.program');

    res.status(200).json({
      success: true,
      message: `Day ${dayObj.dayName} marked as ${dayObj.completed ? 'completed' : 'pending'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset all days in the week to uncompleted
// @route   POST /api/planner/reset-week
const resetWeek = async (req, res, next) => {
  try {
    let plan = await WeeklyPlan.findOne({ user: req.user.id });
    if (!plan) {
      plan = await WeeklyPlan.create(createDefault7DayPlan(req.user.id));
    }

    plan.days.forEach((day) => {
      day.completed = false;
      day.completedAt = null;
    });

    await plan.save();

    const updated = await WeeklyPlan.findById(plan._id).populate('days.program');

    res.status(200).json({
      success: true,
      message: 'Weekly schedule completions have been reset.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply a training template (7-day or 6-day)
// @route   POST /api/planner/template
const applyTemplate = async (req, res, next) => {
  try {
    const { templateType } = req.body; // '7-day' or '6-day'
    let plan = await WeeklyPlan.findOne({ user: req.user.id });

    let newPlanData;
    if (templateType === '6-day') {
      newPlanData = get6DayTemplate(req.user.id);
    } else {
      newPlanData = createDefault7DayPlan(req.user.id);
    }

    if (plan) {
      plan.templateName = newPlanData.templateName;
      plan.days = newPlanData.days;
      await plan.save();
    } else {
      plan = await WeeklyPlan.create(newPlanData);
    }

    const updated = await WeeklyPlan.findById(plan._id).populate('days.program');

    res.status(200).json({
      success: true,
      message: `Applied ${plan.templateName} template successfully.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyPlan,
  updateDayPlan,
  toggleDayComplete,
  resetWeek,
  applyTemplate,
};
