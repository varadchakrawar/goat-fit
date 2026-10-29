const Exercise = require('../models/Exercise');

// @desc    Get all exercises with filters and search
// @route   GET /api/exercises
const getExercises = async (req, res, next) => {
  try {
    const { category, equipment, difficulty, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (equipment && equipment !== 'All') {
      query.equipment = equipment;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { targetMuscles: searchRegex },
        { secondaryMuscles: searchRegex },
        { equipment: searchRegex },
        { instructions: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [exercises, total] = await Promise.all([
      Exercise.find(query).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Exercise.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: exercises.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
      data: exercises,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exercise by ID or slug
// @route   GET /api/exercises/:idOrSlug
const getExerciseByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let exercise;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      exercise = await Exercise.findById(idOrSlug);
    }

    if (!exercise) {
      exercise = await Exercise.findOne({ slug: idOrSlug });
    }

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }

    res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseByIdOrSlug,
};
