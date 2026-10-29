const express = require('express');
const router = express.Router();
const { getPrograms, getProgramByIdOrSlug } = require('../controllers/workoutController');

router.get('/', getPrograms);
router.get('/:idOrSlug', getProgramByIdOrSlug);

module.exports = router;
