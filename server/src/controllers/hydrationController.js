const HydrationLog = require('../models/HydrationLog');

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// @desc    Get or initialize today's hydration log
// @route   GET /api/hydration/today
const getTodayHydration = async (req, res, next) => {
  try {
    const todayStr = req.query.date || getTodayString();

    let log = await HydrationLog.findOne({ user: req.user.id, dateString: todayStr });

    if (!log) {
      // Find the most recent goal setting if any
      const lastLog = await HydrationLog.findOne({ user: req.user.id }).sort({ createdAt: -1 });
      const goalMl = lastLog?.goalMl || 2000;

      log = await HydrationLog.create({
        user: req.user.id,
        dateString: todayStr,
        glasses: 0,
        totalMl: 0,
        goalMl,
        history: [],
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a glass (or custom amount) of water
// @route   POST /api/hydration/log
const logWater = async (req, res, next) => {
  try {
    const { amountMl = 250, date } = req.body;
    const todayStr = date || getTodayString();

    let log = await HydrationLog.findOne({ user: req.user.id, dateString: todayStr });

    if (!log) {
      log = new HydrationLog({
        user: req.user.id,
        dateString: todayStr,
        glasses: 0,
        totalMl: 0,
        goalMl: 2000,
        history: [],
      });
    }

    const ml = Number(amountMl);
    log.totalMl += ml;
    log.glasses = Math.max(0, Math.round(log.totalMl / 250));
    log.history.push({
      timestamp: new Date(),
      amountMl: ml,
      action: 'add',
    });

    await log.save();

    res.status(200).json({
      success: true,
      message: `Added ${ml} ml hydration.`,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Undo / remove a glass of water
// @route   POST /api/hydration/remove
const removeWater = async (req, res, next) => {
  try {
    const { amountMl = 250, date } = req.body;
    const todayStr = date || getTodayString();

    let log = await HydrationLog.findOne({ user: req.user.id, dateString: todayStr });

    if (!log) {
      return res.status(404).json({ success: false, message: 'No hydration log for today.' });
    }

    const ml = Number(amountMl);
    log.totalMl = Math.max(0, log.totalMl - ml);
    log.glasses = Math.max(0, Math.round(log.totalMl / 250));
    log.history.push({
      timestamp: new Date(),
      amountMl: ml,
      action: 'remove',
    });

    await log.save();

    res.status(200).json({
      success: true,
      message: `Removed ${ml} ml hydration.`,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily hydration goal
// @route   PUT /api/hydration/goal
const updateGoal = async (req, res, next) => {
  try {
    const { goalMl, date } = req.body;
    if (!goalMl || goalMl < 500 || goalMl > 8000) {
      return res.status(400).json({ success: false, message: 'Please provide a valid goal between 500ml and 8000ml.' });
    }

    const todayStr = date || getTodayString();
    let log = await HydrationLog.findOne({ user: req.user.id, dateString: todayStr });

    if (!log) {
      log = await HydrationLog.create({
        user: req.user.id,
        dateString: todayStr,
        glasses: 0,
        totalMl: 0,
        goalMl,
        history: [],
      });
    } else {
      log.goalMl = goalMl;
      await log.save();
    }

    res.status(200).json({
      success: true,
      message: 'Hydration goal updated successfully.',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical hydration logs
// @route   GET /api/hydration/history
const getHydrationHistory = async (req, res, next) => {
  try {
    const logs = await HydrationLog.find({ user: req.user.id })
      .sort({ dateString: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayHydration,
  logWater,
  removeWater,
  updateGoal,
  getHydrationHistory,
};
