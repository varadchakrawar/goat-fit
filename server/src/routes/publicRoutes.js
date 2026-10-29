const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  submitContactMessage,
  getPlatformStats,
  getFaqs,
} = require('../controllers/publicController');
const { publicFormLimiter } = require('../middleware/rateLimiter');

router.post('/newsletter', publicFormLimiter, subscribeNewsletter);
router.post('/contact', publicFormLimiter, submitContactMessage);
router.get('/stats', getPlatformStats);
router.get('/faqs', getFaqs);

module.exports = router;
