const express = require('express');
const HydrationLog = require('../models/HydrationLog');
const { protect } = require('../middleware/auth');
const router = express.Router();

const getTodayKey = () => new Date().toISOString().split('T')[0];

// @route   GET /api/hydration/today
// @desc    Get or initialize today's hydration log
// @access  Private
router.get('/today', protect, async (req, res, next) => {
  try {
    const todayKey = getTodayKey();
    let log = await HydrationLog.findOne({ user: req.user._id, dateKey: todayKey });

    if (!log) {
      log = await HydrationLog.create({
        user: req.user._id,
        dateKey: todayKey,
        glassesLogged: 0,
        totalMl: 0,
        dailyGoalMl: 2000,
        glassVolumeMl: 250,
        entries: []
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/hydration/log-glass & /api/hydration/log
// @desc    Add a glass (default 250ml) or custom volume
// @access  Private
router.post(['/log-glass', '/log'], protect, async (req, res, next) => {
  try {
    const todayKey = getTodayKey();
    const volume = parseInt(req.body.volumeMl || req.body.amountMl, 10) || 250;

    let log = await HydrationLog.findOne({ user: req.user._id, $or: [{ dateKey: todayKey }, { dateString: todayKey }] });
    if (!log) {
      log = new HydrationLog({
        user: req.user._id,
        dateKey: todayKey,
        dateString: todayKey,
        glassesLogged: 0,
        glasses: 0,
        totalMl: 0,
        dailyGoalMl: 2000,
        goalMl: 2000,
        glassVolumeMl: 250,
        entries: [],
        history: []
      });
    }

    log.entries = log.entries || [];
    log.entries.push({ amountMl: volume, timestamp: new Date() });
    log.history = log.history || [];
    log.history.push({ amountMl: volume, timestamp: new Date(), action: 'add' });
    log.totalMl += volume;
    const gCount = Math.round(log.totalMl / (log.glassVolumeMl || 250));
    log.glassesLogged = gCount;
    log.glasses = gCount;

    await log.save();

    res.status(200).json({
      success: true,
      message: `Logged +${volume}ml of water! Stay hydrated, Champion!`,
      data: log
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/hydration/undo-glass & /api/hydration/remove
// @desc    Remove last glass or entry
// @access  Private
router.post(['/undo-glass', '/remove'], protect, async (req, res, next) => {
  try {
    const todayKey = getTodayKey();
    let log = await HydrationLog.findOne({ user: req.user._id, $or: [{ dateKey: todayKey }, { dateString: todayKey }] });

    if (!log || log.totalMl <= 0) {
      return res.status(200).json({
        success: true,
        message: 'No hydration entries to undo for today.',
        data: log || { totalMl: 0, glasses: 0, glassesLogged: 0 }
      });
    }

    const removedAmount = parseInt(req.body.volumeMl || req.body.amountMl, 10) || 250;
    if (log.entries && log.entries.length > 0) log.entries.pop();
    log.history = log.history || [];
    log.history.push({ amountMl: removedAmount, timestamp: new Date(), action: 'remove' });
    log.totalMl = Math.max(0, log.totalMl - removedAmount);
    const gCount = Math.max(0, Math.round(log.totalMl / (log.glassVolumeMl || 250)));
    log.glassesLogged = gCount;
    log.glasses = gCount;

    await log.save();

    res.status(200).json({
      success: true,
      message: `Removed -${removedAmount}ml.`,
      data: log
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/hydration/goal
// @desc    Update daily hydration target
// @access  Private
router.put('/goal', protect, async (req, res, next) => {
  try {
    const { dailyGoalMl } = req.body;
    const goal = parseInt(dailyGoalMl, 10);

    if (isNaN(goal) || goal < 500 || goal > 8000) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a realistic daily goal between 500ml and 8000ml.'
      });
    }

    const todayKey = getTodayKey();
    let log = await HydrationLog.findOne({ user: req.user._id, dateKey: todayKey });
    if (!log) {
      log = new HydrationLog({ user: req.user._id, dateKey: todayKey, dailyGoalMl: goal });
    } else {
      log.dailyGoalMl = goal;
    }

    await log.save();

    res.status(200).json({
      success: true,
      message: `Daily hydration goal updated to ${goal}ml.`,
      data: log
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/hydration/history
// @desc    Get historical daily hydration logs
// @access  Private
router.get('/history', protect, async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const history = await HydrationLog.find({ user: req.user._id }).sort({ dateKey: -1 }).limit(days);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
