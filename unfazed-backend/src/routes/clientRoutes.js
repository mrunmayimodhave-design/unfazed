const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  submitIntakeAndConsent,
  getClientPortalData,
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { requireEntitlement } = require('../middleware/entitlementMiddleware');

// Client portal routes (client-accessible)
router.get('/:id/portal', getClientPortalData);
router.post('/:id/intake', submitIntakeAndConsent);

// Therapist CRM routes (protected)
router.get('/', protect, getClients);
router.post('/', protect, requireEntitlement('ADD_CLIENT'), createClient);
router.get('/:id', protect, getClientById);
router.put('/:id', protect, updateClient);

module.exports = router;
