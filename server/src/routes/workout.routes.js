const express = require('express');
const WorkoutProgram = require('../models/WorkoutProgram');
const Exercise = require('../models/Exercise');
const router = express.Router();

// @route   GET /api/workouts
// @desc    Get all workout programs with filters, search, and sorting
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { muscleGroup, category, difficulty, search, sort } = req.query;
    const query = {};

    const targetGroup = muscleGroup || category;
    if (targetGroup && targetGroup !== 'All') {
      query.muscleGroup = targetGroup;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortOption = { order: 1, createdAt: -1 };
    if (sort === 'duration') sortOption = { estimatedDurationMinutes: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'difficulty') sortOption = { difficulty: 1 };

    const programs = await WorkoutProgram.find(query).sort(sortOption).populate('exercises.exercise');

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/workouts/featured
// @desc    Get featured workout programs for landing & highlights
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const featured = await WorkoutProgram.find({ isFeatured: true })
      .limit(6)
      .populate('exercises.exercise');

    // If none marked featured, return top 4
    if (!featured || featured.length === 0) {
      const fallback = await WorkoutProgram.find().limit(4).populate('exercises.exercise');
      return res.status(200).json({ success: true, count: fallback.length, data: fallback });
    }

    res.status(200).json({
      success: true,
      count: featured.length,
      data: featured
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/workouts/:idOrSlug
// @desc    Get single workout program by ID or Slug
// @access  Public
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let program = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      program = await WorkoutProgram.findById(idOrSlug).populate('exercises.exercise');
    }

    if (!program) {
      program = await WorkoutProgram.findOne({ slug: idOrSlug.toLowerCase() }).populate('exercises.exercise');
    }

    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Workout program "${idOrSlug}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
