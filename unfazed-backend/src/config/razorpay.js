const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'your_razorpay_test_key') {
    console.warn('⚠️ Razorpay credentials missing or using placeholder in .env. Test-mode payments will use safe simulation.');
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId || 'rzp_test_placeholder',
      key_secret: keySecret || 'placeholder_secret',
    });
  } catch (error) {
    console.error('Error initializing Razorpay client:', error.message);
  }

  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
