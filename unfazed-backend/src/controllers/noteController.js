const SessionNote = require('../models/SessionNote');
const EntitlementService = require('../services/entitlementService');

/**
 * @route   GET /api/notes
 * @desc    Get all clinical notes for therapist (can filter by client_id, session_id, type)
 * @access  Private (Therapist only)
 */
const getNotes = async (req, res, next) => {
  try {
    const { client_id, session_id, type } = req.query;
    const query = { therapist_id: req.therapist._id };

    if (client_id) query.client_id = client_id;
    if (session_id) query.session_id = session_id;
    if (type && type !== 'all') query.type = type;

    const notes = await SessionNote.find(query)
      .populate('client_id', 'name email')
      .populate('session_id', 'start_time duration_minutes session_type')
      .sort({ is_pinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/:id
 * @desc    Get single note by ID
 * @access  Private (Therapist only)
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await SessionNote.findOne({
      _id: req.params.id,
      therapist_id: req.therapist._id,
    }).populate('client_id', 'name email');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/notes
 * @desc    Create a new clinical note (gated by tier for structured templates)
 * @access  Private (Therapist only)
 */
const createNote = async (req, res, next) => {
  try {
    const { client_id, session_id, type = 'private', format = 'freeform', title, content, soapData, dapData, tags, is_pinned } = req.body;

    if (!client_id || !title) {
      return res.status(400).json({ success: false, message: 'Client and note title are required' });
    }

    // Tier-gating for structured templates (SOAP / DAP)
    if (format === 'soap' || format === 'dap') {
      const access = await EntitlementService.canAccess(req.therapist._id, 'NOTE_TEMPLATE', { template: format });
      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          upgradeRequired: true,
          message: access.reason,
          tierName: access.tierName,
          allowedTemplates: access.allowedTemplates,
        });
      }
    }

    const note = await SessionNote.create({
      therapist_id: req.therapist._id,
      client_id,
      session_id: session_id || null,
      type: type === 'shared' ? 'shared' : 'private',
      format,
      title,
      content: content || '',
      soapData: soapData || {},
      dapData: dapData || {},
      tags: tags || [],
      is_pinned: !!is_pinned,
    });

    res.status(201).json({
      success: true,
      message: `${note.type === 'private' ? 'Private clinical' : 'Shared client'} note created successfully`,
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a clinical note
 * @access  Private (Therapist only)
 */
const updateNote = async (req, res, next) => {
  try {
    const { type, format, title, content, soapData, dapData, tags, is_pinned } = req.body;

    if (format === 'soap' || format === 'dap') {
      const access = await EntitlementService.canAccess(req.therapist._id, 'NOTE_TEMPLATE', { template: format });
      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          upgradeRequired: true,
          message: access.reason,
        });
      }
    }

    const note = await SessionNote.findOneAndUpdate(
      { _id: req.params.id, therapist_id: req.therapist._id },
      {
        type,
        format,
        title,
        content,
        soapData,
        dapData,
        tags,
        is_pinned,
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a clinical note
 * @access  Private (Therapist only)
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await SessionNote.findOneAndDelete({
      _id: req.params.id,
      therapist_id: req.therapist._id,
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/shared/client/:clientId
 * @desc    Client-facing route for shared notes only
 * @access  Public / Client
 * @note    ARCHITECTURAL PRINCIPLE: Never return private notes on any client-facing route!
 */
const getSharedNotesForClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    // Strict query: ONLY type: 'shared'
    const notes = await SessionNote.find({
      client_id: clientId,
      type: 'shared',
    })
      .select('title content createdAt format')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getSharedNotesForClient,
};
