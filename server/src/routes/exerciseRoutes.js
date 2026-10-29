const express = require('express');
const router = express.Router();
const { getExercises, getExerciseByIdOrSlug } = require('../controllers/exerciseController');

router.get('/', getExercises);
router.get('/:idOrSlug', getExerciseByIdOrSlug);

module.exports = router;
