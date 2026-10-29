const ProgressEntry = require('../models/ProgressEntry');

// @desc    Get all progress entries for current user
// @route   GET /api/progress
const getProgressEntries = async (req, res, next) => {
  try {
    const entries = await ProgressEntry.find({ user: req.user.id }).sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new progress / PR entry
// @route   POST /api/progress
const addProgressEntry = async (req, res, next) => {
  try {
    const { weightKg, benchPressPrKg, squatPrKg, deadliftPrKg, notes, date } = req.body;

    const entry = await ProgressEntry.create({
      user: req.user.id,
      date: date || new Date(),
      weightKg,
      benchPressPrKg,
      squatPrKg,
      deadliftPrKg,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Progress metrics logged successfully.',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgressEntries,
  addProgressEntry,
};
