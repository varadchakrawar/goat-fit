const WorkoutProgram = require('../models/WorkoutProgram');
const Exercise = require('../models/Exercise');

// @desc    Get all workout programs with filters, search, and sorting
// @route   GET /api/workouts
const getPrograms = async (req, res, next) => {
  try {
    const { category, difficulty, search, sort, page = 1, limit = 20 } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { targetMuscles: searchRegex },
        { equipment: searchRegex },
      ];
    }

    let sortOption = { isFeatured: -1, createdAt: -1 };
    if (sort === 'duration_asc') sortOption = { durationMinutes: 1 };
    if (sort === 'duration_desc') sortOption = { durationMinutes: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'difficulty') sortOption = { difficulty: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [programs, total] = await Promise.all([
      WorkoutProgram.find(query)
        .populate('exercises.exercise')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      WorkoutProgram.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
      data: programs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout program by ID or slug
// @route   GET /api/workouts/:idOrSlug
const getProgramByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let program;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      program = await WorkoutProgram.findById(idOrSlug).populate('exercises.exercise');
    }

    if (!program) {
      program = await WorkoutProgram.findOne({ slug: idOrSlug }).populate('exercises.exercise');
    }

    if (!program) {
      return res.status(404).json({ success: false, message: 'Workout program not found.' });
    }

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrograms,
  getProgramByIdOrSlug,
};
