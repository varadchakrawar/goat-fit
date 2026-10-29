const express = require('express');
const router = express.Router();
const {
  getWeeklyPlan,
  updateDayPlan,
  toggleDayComplete,
  resetWeek,
  applyTemplate,
} = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All planner routes require authentication

router.get('/', getWeeklyPlan);
router.put('/day/:dayIndex', updateDayPlan);
router.patch('/day/:dayIndex/toggle-complete', toggleDayComplete);
router.post('/reset-week', resetWeek);
router.post('/template', applyTemplate);

module.exports = router;
