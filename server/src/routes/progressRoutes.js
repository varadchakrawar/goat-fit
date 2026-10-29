const express = require('express');
const router = express.Router();
const { getProgressEntries, addProgressEntry } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProgressEntries);
router.post('/', addProgressEntry);

module.exports = router;
