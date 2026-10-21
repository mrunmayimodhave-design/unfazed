const Therapist = require('../models/Therapist');
const Package = require('../models/Package');
const LeadDistributionService = require('../services/leadDistributionService');
const EntitlementService = require('../services/entitlementService');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

/**
 * @route   GET /api/therapist/public/:slug
 * @desc    Get therapist's public-facing branded profile
 * @access  Public
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const therapist = await Therapist.findOne({ slug: slug.toLowerCase(), is_active: true }).select(
      'name slug title bio specializations languages hourly_rate currency avatar cover_image qualifications years_of_experience timezone'
    );

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found' });
    }

    const packages = await Package.find({ therapist_id: therapist._id, is_active: true });

    // Open Graph meta tag preview payload
    const metaTags = {
      title: `${therapist.name} | ${therapist.title} - Unfazed`,
      description: therapist.bio.substring(0, 160),
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${therapist.slug}`,
      image: therapist.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    };

    res.json({
      success: true,
      therapist,
      packages,
      metaTags,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/therapist/directory
 * @desc    Get public directory of available therapists for clients
 * @access  Public
 */
const getTherapistDirectory = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const query = { is_active: true };

    if (specialization) {
      query.specializations = { $regex: specialization, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { specializations: { $regex: search, $options: 'i' } },
      ];
    }

    const therapists = await Therapist.find(query)
      .select(
        'name slug title bio specializations languages hourly_rate currency avatar qualifications years_of_experience'
      )
      .sort({ years_of_experience: -1 });

    res.json({
      success: true,
      count: therapists.length,
      therapists,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/therapist/profile
 * @desc    Update therapist's own practice profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'title',
      'bio',
      'specializations',
      'languages',
      'hourly_rate',
      'phone',
      'avatar',
      'cover_image',
      'qualifications',
      'years_of_experience',
      'timezone',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Therapist.findByIdAndUpdate(req.therapist._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password_hash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      therapist: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/therapist/public/:slug/lead
 * @desc    Submit a prospective client inquiry from branded page
 * @access  Public
 */
const submitLead = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name, email, phone, message, preferred_time } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found' });
    }

    const lead = await LeadDistributionService.captureLead(therapist, {
      name,
      email,
      phone,
      message,
      preferred_time,
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. The therapist will contact you shortly.',
      leadId: lead._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/therapist/subscription
 * @desc    Get subscription status and tier caps
 * @access  Private
 */
const getSubscription = async (req, res, next) => {
  try {
    const summary = await EntitlementService.getSubscriptionSummary(req.therapist._id);
    res.json({
      success: true,
      subscription: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/therapist/subscription/upgrade
 * @desc    Upgrade subscription tier (Starter, Pro, Enterprise)
 * @access  Private
 */
const upgradeSubscription = async (req, res, next) => {
  try {
    const { tier_key } = req.body;
    if (!['free', 'starter', 'pro', 'enterprise'].includes(tier_key)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription tier selected' });
    }

    const tierConfig = await SubscriptionTierConfig.findOne({ tier_key });
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const updated = await Therapist.findByIdAndUpdate(
      req.therapist._id,
      {
        subscription_tier: tier_key,
        tier_expiry: expiry,
      },
      { new: true }
    );

    const summary = await EntitlementService.getSubscriptionSummary(updated._id);

    res.json({
      success: true,
      message: `Successfully updated subscription to ${tierConfig ? tierConfig.tier_name : tier_key.toUpperCase()}`,
      therapist: updated,
      subscription: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTherapistDirectory,
  getPublicProfile,
  updateProfile,
  submitLead,
  getSubscription,
  upgradeSubscription,
};
