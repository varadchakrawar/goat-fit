const express = require('express');
const router = express.Router();
const {
  getTodayHydration,
  logWater,
  removeWater,
  updateGoal,
  getHydrationHistory,
} = require('../controllers/hydrationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getTodayHydration);
router.post('/log', logWater);
router.post('/remove', removeWater);
router.put('/goal', updateGoal);
router.get('/history', getHydrationHistory);

module.exports = router;
