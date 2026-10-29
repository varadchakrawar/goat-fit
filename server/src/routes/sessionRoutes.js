const express = require('express');
const router = express.Router();
const { recordSession, getSessions, getSessionStats } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', recordSession);
router.get('/', getSessions);
router.get('/stats', getSessionStats);

module.exports = router;
