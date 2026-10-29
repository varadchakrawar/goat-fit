const express = require('express');
const Exercise = require('../models/Exercise');
const router = express.Router();

// @route   GET /api/exercises
// @desc    List exercises with filtering and search
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { muscle, targetMuscles, equipment, difficulty, search } = req.query;
    const query = {};

    const muscleFilter = muscle || targetMuscles;
    if (muscleFilter && muscleFilter !== 'All') {
      query.targetMuscles = { $in: [new RegExp(muscleFilter, 'i')] };
    }

    if (equipment && equipment !== 'All') {
      query.equipment = equipment;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { targetMuscles: { $in: [new RegExp(search.trim(), 'i')] } },
        { equipment: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/exercises/:idOrSlug
// @desc    Get detailed exercise information
// @access  Public
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let exercise = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      exercise = await Exercise.findById(idOrSlug);
    }

    if (!exercise) {
      exercise = await Exercise.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: `Exercise "${idOrSlug}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
