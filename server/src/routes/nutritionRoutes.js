const express = require('express');
const router = express.Router();
const {
  calculate,
  getNutritionProfile,
  saveNutritionProfile,
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

// Public or guest calculation
router.post('/calculate', calculate);

// Protected endpoints for saving & retrieving authenticated user profile
router.get('/profile', protect, getNutritionProfile);
router.put('/profile', protect, saveNutritionProfile);

module.exports = router;
