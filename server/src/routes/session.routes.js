const express = require('express');
const WorkoutSession = require('../models/WorkoutSession');
const WeeklyPlan = require('../models/WeeklyPlan');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/sessions
// @desc    Record/Finish a workout session
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      programId,
      workoutTitle,
      muscleGroup,
      startTime,
      endTime,
      durationMinutes,
      completedExercises,
      notes,
      isCompleted
    } = req.body;

    const targetTitle = (req.body.workoutTitle || req.body.programName || '').trim();
    if (!targetTitle) {
      return res.status(400).json({ success: false, message: 'Workout title or program name is required.' });
    }

    const exList = req.body.completedExercises || req.body.exercises || [];
    let totalVolume = 0;
    exList.forEach((ex) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((st) => {
          if (st.completed && st.weightKg && st.reps) {
            totalVolume += st.weightKg * st.reps;
          }
        });
      }
    });

    const session = await WorkoutSession.create({
      user: req.user._id,
      program: req.body.programId || null,
      workoutTitle: targetTitle,
      programName: targetTitle,
      muscleGroup: req.body.muscleGroup || 'Full Body',
      startTime: req.body.startTime || new Date(Date.now() - (req.body.durationMinutes || 50) * 60000),
      endTime: req.body.endTime || new Date(),
      durationMinutes: req.body.durationMinutes || 50,
      totalVolumeKg: Math.round(totalVolume),
      completedExercises: exList,
      exercises: exList,
      notes: req.body.notes || '',
      isCompleted: req.body.isCompleted !== undefined ? req.body.isCompleted : true,
      completed: req.body.isCompleted !== undefined ? req.body.isCompleted : true
    });

    // Mark today's plan day as completed if matching
    try {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = daysOfWeek[new Date().getDay()];
      const plan = await WeeklyPlan.findOne({ user: req.user._id });
      if (plan) {
        const todayDay = plan.days.find((d) => d.dayOfWeek === todayName);
        if (todayDay && !todayDay.isCompleted) {
          todayDay.isCompleted = true;
          todayDay.completedAt = new Date();
          await plan.save();
        }
      }
    } catch (planUpdateErr) {
      console.warn('[Session] Note updating plan:', planUpdateErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Workout session recorded successfully! Great work!',
      data: session
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/sessions
// @desc    Get user's workout sessions history
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const sessions = await WorkoutSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('program');

    const total = await WorkoutSession.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/sessions/stats
// @desc    Get user aggregate workout stats for dashboard
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const totalSessions = await WorkoutSession.countDocuments({ user: req.user._id, isCompleted: true });

    // Aggregate total duration & muscle groups
    const aggregateData = await WorkoutSession.aggregate([
      { $match: { user: req.user._id, isCompleted: true } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$durationMinutes' },
          totalSets: { $sum: { $size: { $ifNull: ['$completedExercises', []] } } }
        }
      }
    ]);

    const stats = aggregateData[0] || { totalMinutes: 0, totalSets: 0 };

    // Breakdown by muscle group
    const muscleDistribution = await WorkoutSession.aggregate([
      { $match: { user: req.user._id, isCompleted: true } },
      { $group: { _id: '$muscleGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalWorkouts: totalSessions,
        totalMinutes: stats.totalMinutes,
        totalSets: stats.totalSets,
        muscleDistribution
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/sessions/:id
// @desc    Get specific workout session details
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const session = await WorkoutSession.findOne({ _id: req.params.id, user: req.user._id }).populate('program');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
