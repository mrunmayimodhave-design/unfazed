const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const notificationService = require('../services/notificationService');

/**
 * Helper to generate available slots for a given date
 */
const generateAvailableSlotsForDay = (dateStr, weeklySchedule, existingSessions, bufferMinutes = 15, duration = 60) => {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = targetDate.getDay();

  const dayConfig = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
  if (!dayConfig || !dayConfig.enabled || !dayConfig.slots || dayConfig.slots.length === 0) {
    return [];
  }

  const generatedSlots = [];

  for (const window of dayConfig.slots) {
    const [startH, startM] = window.startTime.split(':').map(Number);
    const [endH, endM] = window.endTime.split(':').map(Number);

    const windowStart = new Date(targetDate);
    windowStart.setHours(startH, startM, 0, 0);

    const windowEnd = new Date(targetDate);
    windowEnd.setHours(endH, endM, 0, 0);

    let currentSlotStart = new Date(windowStart);

    while (currentSlotStart.getTime() + duration * 60000 <= windowEnd.getTime()) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + duration * 60000);

      // Check collision with existing sessions (booked or confirmed)
      const hasConflict = existingSessions.some((session) => {
        if (session.status === 'cancelled') return false;
        const bookedStart = new Date(session.start_time).getTime();
        const bookedEnd = new Date(session.end_time).getTime();

        const slotStartMs = currentSlotStart.getTime();
        const slotEndMs = currentSlotEnd.getTime();

        return slotStartMs < bookedEnd && slotEndMs > bookedStart;
      });

      // Filter out past slots if date is today
      const now = new Date();
      const isPast = currentSlotStart.getTime() <= now.getTime();

      if (!hasConflict && !isPast) {
        generatedSlots.push({
          start_time: currentSlotStart.toISOString(),
          end_time: currentSlotEnd.toISOString(),
          duration_minutes: duration,
          formatted_time: currentSlotStart.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        });
      }

      // Next slot after duration + buffer
      currentSlotStart = new Date(currentSlotEnd.getTime() + bufferMinutes * 60000);
    }
  }

  return generatedSlots;
};

/**
 * @route   GET /api/scheduling/availability
 * @desc    Get therapist's weekly schedule template
 * @access  Private
 */
const getTherapistAvailability = async (req, res, next) => {
  try {
    let availability = await Availability.findOne({ therapist_id: req.therapist._id });
    if (!availability) {
      availability = await Availability.create({
        therapist_id: req.therapist._id,
        timezone: req.therapist.timezone || 'Asia/Kolkata',
      });
    }

    res.json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/scheduling/availability
 * @desc    Update therapist's weekly availability template & buffer times
 * @access  Private
 */
const updateAvailability = async (req, res, next) => {
  try {
    const { weekly_schedule, buffer_time_minutes, session_durations, timezone, blocked_slots, overrides } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { therapist_id: req.therapist._id },
      {
        weekly_schedule,
        buffer_time_minutes,
        session_durations,
        timezone,
        blocked_slots,
        overrides,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Availability schedule updated successfully',
      availability,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/scheduling/public/:slug/slots
 * @desc    Get open available slots for a given therapist and date range (public booking)
 * @access  Public
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { date, duration = 60 } = req.query; // date in YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date (YYYY-MM-DD) is required' });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const availability = await Availability.findOne({ therapist_id: therapist._id });
    if (!availability) {
      return res.json({ success: true, slots: [], message: 'No schedule configured' });
    }

    // Query existing sessions for that day
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const existingSessions = await Session.find({
      therapist_id: therapist._id,
      start_time: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' },
    });

    const slots = generateAvailableSlotsForDay(
      date,
      availability.weekly_schedule,
      existingSessions,
      availability.buffer_time_minutes || 15,
      Number(duration)
    );

    res.json({
      success: true,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        hourly_rate: therapist.hourly_rate,
        timezone: availability.timezone,
      },
      date,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/scheduling/book
 * @desc    Book a slot with double-booking prevention & instant confirmation
 * @access  Public / Client
 */
const bookSlot = async (req, res, next) => {
  try {
    const { therapist_id, client_id, client_name, client_email, client_phone, start_time, duration_minutes = 60, session_type = 'video' } = req.body;

    if (!therapist_id || !start_time) {
      return res.status(400).json({ success: false, message: 'Therapist and start time are required' });
    }

    const therapist = await Therapist.findById(therapist_id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + duration_minutes * 60000);

    // CRITICAL: Double-booking prevention check
    const overlappingSession = await Session.findOne({
      therapist_id,
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        { start_time: { $lt: endTime, $gte: startTime } },
        { end_time: { $gt: startTime, $lte: endTime } },
        { start_time: { $lte: startTime }, end_time: { $gte: endTime } },
      ],
    });

    if (overlappingSession) {
      return res.status(409).json({
        success: false,
        message: 'This slot is no longer available. Please select another time.',
        doubleBookingPrevented: true,
      });
    }

    // Find or create client
    let client;
    if (client_id) {
      client = await Client.findById(client_id);
    } else if (client_email) {
      client = await Client.findOne({ therapist_id, email: client_email.toLowerCase() });
      if (!client) {
        client = await Client.create({
          therapist_id,
          name: client_name || 'Anonymous Client',
          email: client_email.toLowerCase(),
          phone: client_phone || '',
          status: 'active',
          tags: ['Online Booking'],
        });
      }
    }

    if (!client) {
      return res.status(400).json({ success: false, message: 'Valid client identification required' });
    }

    const session = await Session.create({
      therapist_id,
      client_id: client._id,
      start_time: startTime,
      end_time: endTime,
      duration_minutes,
      session_type,
      fee: therapist.hourly_rate || 1500,
      meeting_link: `https://meet.unfazed.in/${Math.random().toString(36).substring(7)}`,
      status: 'confirmed',
      payment_status: 'unpaid',
    });

    // Update client last session date
    client.last_session_at = startTime;
    await client.save();

    // Fire event-driven notifications
    await notificationService.onBookingConfirmed({ client, therapist, session });

    res.status(201).json({
      success: true,
      message: 'Session successfully booked and confirmed.',
      session,
      client: {
        id: client._id,
        _id: client._id,
        name: client.name,
        email: client.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/scheduling/sessions
 * @desc    Get therapist's sessions (calendar / list view)
 * @access  Private
 */
const getSessions = async (req, res, next) => {
  try {
    const { start, end, status } = req.query;
    const query = { therapist_id: req.therapist._id };

    if (start && end) {
      query.start_time = { $gte: new Date(start), $lte: new Date(end) };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('client_id', 'name email phone avatar tags status')
      .sort({ start_time: 1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/scheduling/sessions/:id/status
 * @desc    Update session status (completed, cancelled, no_show)
 * @access  Private
 */
const updateSessionStatus = async (req, res, next) => {
  try {
    const { status, cancellation_reason } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      therapist_id: req.therapist._id,
    }).populate('client_id');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = status;
    if (cancellation_reason) {
      session.cancellation_reason = cancellation_reason;
      session.cancelled_by = 'therapist';
    }

    if (status === 'completed') {
      await Client.findByIdAndUpdate(session.client_id._id, {
        $inc: { total_sessions_completed: 1 },
      });
    }

    await session.save();

    res.json({
      success: true,
      message: `Session status updated to ${status}`,
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTherapistAvailability,
  updateAvailability,
  getAvailableSlots,
  bookSlot,
  getSessions,
  updateSessionStatus,
};
