const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const Package = require('../models/Package');
const { getUniqueSlug } = require('../utils/generateSlug');
const EntitlementService = require('../services/entitlementService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'unfazed_jwt_super_secret_key_2026_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new therapist
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, title, phone, hourly_rate, specializations, languages } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingTherapist = await Therapist.findOne({ email: email.toLowerCase() });
    if (existingTherapist) {
      return res.status(400).json({ success: false, message: 'A therapist with this email already exists' });
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate unique slug
    const slug = await getUniqueSlug(Therapist, name);

    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password_hash,
      slug,
      title: title || 'Licensed Clinical Psychologist',
      phone: phone || '',
      hourly_rate: hourly_rate ? Number(hourly_rate) : 1500,
      specializations: specializations || ['Cognitive Behavioral Therapy (CBT)', 'Stress & Anxiety'],
      languages: languages || ['English', 'Hindi'],
      subscription_tier: 'free',
    });

    // Initialize default weekly availability
    await Availability.create({
      therapist_id: therapist._id,
      timezone: 'Asia/Kolkata',
      buffer_time_minutes: 15,
      session_durations: [30, 45, 60, 90],
    });

    // Initialize starter session packages
    await Package.insertMany([
      {
        therapist_id: therapist._id,
        name: '3-Session Discovery Pack',
        session_count: 3,
        total_price: therapist.hourly_rate * 3 * 0.95,
        per_session_rate: (therapist.hourly_rate * 3 * 0.95) / 3,
        discount_percent: 5,
        validity_days: 60,
        description: 'Ideal for initial assessment and targeted goal setting.',
      },
      {
        therapist_id: therapist._id,
        name: '6-Session Progress Bundle',
        session_count: 6,
        total_price: therapist.hourly_rate * 6 * 0.9,
        per_session_rate: (therapist.hourly_rate * 6 * 0.9) / 6,
        discount_percent: 10,
        validity_days: 120,
        description: 'Our most popular package for deep behavioral work.',
      },
    ]);

    const token = generateToken(therapist._id);
    const entitlementSummary = await EntitlementService.getSubscriptionSummary(therapist._id);

    res.status(201).json({
      success: true,
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        title: therapist.title,
        subscription_tier: therapist.subscription_tier,
      },
      entitlement: entitlementSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate therapist & get token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const therapist = await Therapist.findOne({ email: email.toLowerCase() });
    if (!therapist) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, therapist.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(therapist._id);
    const entitlementSummary = await EntitlementService.getSubscriptionSummary(therapist._id);

    res.json({
      success: true,
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        title: therapist.title,
        avatar: therapist.avatar,
        subscription_tier: therapist.subscription_tier,
      },
      entitlement: entitlementSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current therapist profile & subscription entitlement
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const entitlementSummary = await EntitlementService.getSubscriptionSummary(req.therapist._id);
    res.json({
      success: true,
      therapist: req.therapist,
      entitlement: entitlementSummary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
