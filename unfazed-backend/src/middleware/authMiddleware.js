const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unfazed_jwt_super_secret_key_2026_secure');

      req.therapist = await Therapist.findById(decoded.id).select('-password_hash');
      if (!req.therapist) {
        return res.status(401).json({ success: false, message: 'Not authorized, therapist not found' });
      }

      req.therapistId = req.therapist._id.toString();
      next();
    } catch (error) {
      console.error('Auth token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
