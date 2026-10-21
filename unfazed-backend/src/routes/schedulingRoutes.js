const express = require('express');
const router = express.Router();
const {
  getTherapistAvailability,
  updateAvailability,
  getAvailableSlots,
  bookSlot,
  getSessions,
  updateSessionStatus,
} = require('../controllers/schedulingController');
const { protect } = require('../middleware/authMiddleware');

// Public booking slot discovery & instant reservation
router.get('/public/:slug/slots', getAvailableSlots);
router.post('/book', bookSlot);

// Therapist schedule management (protected)
router.get('/availability', protect, getTherapistAvailability);
router.put('/availability', protect, updateAvailability);
router.get('/sessions', protect, getSessions);
router.put('/sessions/:id/status', protect, updateSessionStatus);

module.exports = router;
