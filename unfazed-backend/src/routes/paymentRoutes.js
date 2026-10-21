const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  downloadInvoice,
  getTherapistPayments,
  getPackages,
  createPackage,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public client checkout & invoice download
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.get('/invoice/:invoiceNumber/download', downloadInvoice);
router.get('/packages', getPackages);

// Therapist payment & package management
router.get('/therapist', protect, getTherapistPayments);
router.post('/packages', protect, createPackage);

module.exports = router;
