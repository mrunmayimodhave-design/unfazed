const express = require('express');
const router = express.Router();
const {
  getTherapistDirectory,
  getPublicProfile,
  updateProfile,
  submitLead,
  getSubscription,
  upgradeSubscription,
} = require('../controllers/therapistController');
const { protect } = require('../middleware/authMiddleware');

// Public directory & branded profile routes
router.get('/directory', getTherapistDirectory);
router.get('/public/:slug', getPublicProfile);
router.post('/public/:slug/lead', submitLead);

// Private therapist routes
router.put('/profile', protect, updateProfile);
router.get('/subscription', protect, getSubscription);
router.post('/subscription/upgrade', protect, upgradeSubscription);

module.exports = router;
