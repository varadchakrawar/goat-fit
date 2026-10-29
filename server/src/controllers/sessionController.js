const WorkoutSession = require('../models/WorkoutSession');
const WeeklyPlan = require('../models/WeeklyPlan');

// @desc    Record completed workout session
// @route   POST /api/sessions
const recordSession = async (req, res, next) => {
  try {
    const {
      programId,
      programName,
      startTime,
      endTime,
      durationMinutes,
      exercises,
      notes,
      dayIndex,
    } = req.body;

    if (!programName || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'Program name and duration are required.' });
    }

    // Calculate total volume
    let totalVolume = 0;
    if (exercises && Array.isArray(exercises)) {
      exercises.forEach((ex) => {
        if (ex.sets && Array.isArray(ex.sets)) {
          ex.sets.forEach((st) => {
            if (st.completed && st.weightKg && st.reps) {
              totalVolume += st.weightKg * st.reps;
            }
          });
        }
      });
    }

    const session = await WorkoutSession.create({
      user: req.user.id,
      program: programId || null,
      programName,
      startTime: startTime || new Date(Date.now() - durationMinutes * 60000),
      endTime: endTime || new Date(),
      durationMinutes,
      totalVolumeKg: Math.round(totalVolume),
      completed: true,
      notes: notes || '',
      exercises: exercises || [],
    });

    // If dayIndex was passed, also mark that day completed in the weekly plan!
    if (dayIndex !== undefined && dayIndex >= 0 && dayIndex <= 6) {
      const plan = await WeeklyPlan.findOne({ user: req.user.id });
      if (plan) {
        const dayObj = plan.days.find((d) => d.dayIndex === dayIndex);
        if (dayObj) {
          dayObj.completed = true;
          dayObj.completedAt = new Date();
          await plan.save();
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Workout session recorded successfully! Beast mode activated.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's workout sessions history
// @route   GET /api/sessions
const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      WorkoutSession.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      WorkoutSession.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's workout session aggregated statistics
// @route   GET /api/sessions/stats
const getSessionStats = async (req, res, next) => {
  try {
    const sessions = await WorkoutSession.find({ user: req.user.id });

    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalVolumeKg = sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);

    // Calculate this week's sessions
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const workoutsThisWeek = sessions.filter((s) => new Date(s.createdAt) >= oneWeekAgo).length;

    res.status(200).json({
      success: true,
      data: {
        totalWorkouts,
        totalMinutes,
        totalVolumeKg,
        workoutsThisWeek,
        recentSessions: sessions.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordSession,
  getSessions,
  getSessionStats,
};
