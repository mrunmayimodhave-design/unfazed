const Client = require('../models/Client');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const SessionNote = require('../models/SessionNote');
const EntitlementService = require('../services/entitlementService');

/**
 * @route   GET /api/clients
 * @desc    Get all clients for therapist (with sorting, filtering, and search)
 * @access  Private
 */
const getClients = async (req, res, next) => {
  try {
    const { status, tag, search, sort = 'createdAt', order = 'desc' } = req.query;

    const query = { therapist_id: req.therapist._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sort] = order === 'asc' ? 1 : -1;

    const clients = await Client.find(query).sort(sortOption);
    const totalCount = await Client.countDocuments({ therapist_id: req.therapist._id });
    const activeCount = await Client.countDocuments({ therapist_id: req.therapist._id, status: 'active' });

    res.json({
      success: true,
      count: clients.length,
      totalCount,
      activeCount,
      clients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/clients/:id
 * @desc    Get single client aggregated profile (sessions, payments, notes)
 * @access  Private
 */
const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      therapist_id: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Aggregate session history
    const sessions = await Session.find({ client_id: client._id }).sort({ start_time: -1 });

    // Aggregate payment history
    const payments = await Payment.find({ client_id: client._id }).sort({ createdAt: -1 });

    // Aggregate clinical notes (therapist sees BOTH private and shared notes)
    const notes = await SessionNote.find({ client_id: client._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      client,
      sessions,
      payments,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/clients
 * @desc    Create a new client (gated by tier capacity)
 * @access  Private
 */
const createClient = async (req, res, next) => {
  try {
    // Entitlement gate check
    const entitlement = await EntitlementService.canAccess(req.therapist._id, 'ADD_CLIENT');
    if (!entitlement.allowed) {
      return res.status(403).json({
        success: false,
        upgradeRequired: true,
        message: entitlement.reason,
        currentUsage: entitlement.currentUsage,
        limit: entitlement.limit,
      });
    }

    const { name, email, phone, status, tags, intakeData, custom_fields } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Client name and email are required' });
    }

    // Check duplicate email for this therapist
    const existing = await Client.findOne({
      therapist_id: req.therapist._id,
      email: email.toLowerCase(),
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'A client with this email already exists in your practice' });
    }

    const client = await Client.create({
      therapist_id: req.therapist._id,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      status: status || 'active',
      tags: tags || ['New Client'],
      intakeData: intakeData || {},
      custom_fields: custom_fields || {},
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client profile details
 * @access  Private
 */
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, therapist_id: req.therapist._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/clients/:id/intake
 * @desc    Submit intake form and auditable digital consent
 * @access  Public / Client
 */
const submitIntakeAndConsent = async (req, res, next) => {
  try {
    const { intakeData, consentAgreed, signatureName } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client record not found' });
    }

    if (!consentAgreed) {
      return res.status(400).json({ success: false, message: 'Explicit consent is required to proceed with therapy.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    client.intakeData = {
      ...client.intakeData,
      ...intakeData,
    };

    client.consent = {
      agreed: true,
      timestamp: new Date(),
      ipAddress: clientIp,
      terms_version: 'v1.0-standard-hipaa-in',
      signature_name: signatureName || client.name,
    };

    await client.save();

    res.json({
      success: true,
      message: 'Intake and digital consent successfully recorded.',
      consent: client.consent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/clients/:id/portal
 * @desc    Client portal view (safe serialization: shared notes ONLY, sessions, payments)
 * @access  Public / Client with Token or ID
 */
const getClientPortalData = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('therapist_id', 'name title email phone avatar hourly_rate slug');
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const sessions = await Session.find({ client_id: client._id }).sort({ start_time: -1 });
    const payments = await Payment.find({ client_id: client._id }).sort({ createdAt: -1 });

    // CRITICAL: Return ONLY shared notes! Private notes are strictly excluded.
    const sharedNotes = await SessionNote.find({
      client_id: client._id,
      type: 'shared',
    })
      .select('title content createdAt format')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        consent: client.consent,
        intakeData: client.intakeData,
      },
      therapist: client.therapist_id,
      sessions,
      payments,
      sharedNotes, // Guaranteed safe!
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  submitIntakeAndConsent,
  getClientPortalData,
};
