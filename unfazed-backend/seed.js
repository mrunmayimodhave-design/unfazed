require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Therapist = require('./src/models/Therapist');
const Client = require('./src/models/Client');
const Session = require('./src/models/Session');
const SessionNote = require('./src/models/SessionNote');
const Availability = require('./src/models/Availability');
const Payment = require('./src/models/Payment');
const Package = require('./src/models/Package');
const SubscriptionTierConfig = require('./src/models/SubscriptionTierConfig');
const { connectDB } = require('./src/config/db');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing collections...');
    await SubscriptionTierConfig.deleteMany({});
    await Therapist.deleteMany({});
    await Client.deleteMany({});
    await Session.deleteMany({});
    await SessionNote.deleteMany({});
    await Availability.deleteMany({});
    await Payment.deleteMany({});
    await Package.deleteMany({});

    console.log('🌱 Seeding Subscription Tier Configurations (Config-driven, no hardcoding)...');
    const tiers = await SubscriptionTierConfig.insertMany([
      {
        tier_name: 'Starter (Free)',
        tier_key: 'free',
        price: { monthly: 0, yearly: 0, currency: 'INR' },
        caps: {
          max_active_clients: 5,
          max_sessions_per_month: 30,
        },
        features: {
          allowed_note_templates: ['freeform'],
          analytics_depth: 'basic',
          custom_branding: false,
          real_time_chat: true,
          automated_reminders: false,
          gst_invoicing: true,
          priority_support: false,
        },
        description: 'Perfect for solo practitioners starting their online private practice.',
      },
      {
        tier_name: 'Professional',
        tier_key: 'pro',
        price: { monthly: 1999, yearly: 19990, currency: 'INR' },
        caps: {
          max_active_clients: 25,
          max_sessions_per_month: 150,
        },
        features: {
          allowed_note_templates: ['freeform', 'soap'],
          analytics_depth: 'advanced',
          custom_branding: true,
          real_time_chat: true,
          automated_reminders: true,
          gst_invoicing: true,
          priority_support: false,
        },
        description: 'For growing practices needing structured SOAP notes, automated reminders, and higher client caps.',
      },
      {
        tier_name: 'Enterprise Practice',
        tier_key: 'enterprise',
        price: { monthly: 4999, yearly: 49990, currency: 'INR' },
        caps: {
          max_active_clients: 9999,
          max_sessions_per_month: 9999,
        },
        features: {
          allowed_note_templates: ['freeform', 'soap', 'dap'],
          analytics_depth: 'full',
          custom_branding: true,
          real_time_chat: true,
          automated_reminders: true,
          gst_invoicing: true,
          priority_support: true,
        },
        description: 'Uncapped capacity with DAP notes, full clinical analytics, and priority assistance.',
      },
    ]);

    console.log(`Created ${tiers.length} subscription tiers.`);

    console.log('🌱 Seeding Demo Therapist...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('Password123!', salt);

    const therapist = await Therapist.create({
      name: 'Dr. Ananya Roy',
      email: 'dr.ananya@unfazed.in',
      password_hash,
      slug: 'dr-ananya-roy',
      title: 'Senior Clinical Psychologist & Psychotherapist',
      bio: 'Helping individuals, couples, and young professionals navigate stress, relationship challenges, depression, and life transitions with evidence-based Cognitive Behavioral Therapy (CBT) and compassionate mindfulness frameworks.',
      specializations: [
        'Cognitive Behavioral Therapy (CBT)',
        'Anxiety & Panic Disorders',
        'Relationship Counseling',
        'Burnout & Workplace Stress',
        'Mindfulness-Based Stress Reduction',
      ],
      languages: ['English', 'Hindi', 'Bengali'],
      phone: '+91 98200 12345',
      hourly_rate: 1800,
      currency: 'INR',
      avatar: 'https://images.unsplash.com/photo-1594824813593-3c94f57c5a92?auto=format&fit=crop&w=600&q=80',
      cover_image: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1200&q=80',
      qualifications: ['M.Phil. in Clinical Psychology (NIMHANS)', 'RCI Licensed (CRR: A12984)'],
      years_of_experience: 8,
      subscription_tier: 'pro', // Start with Pro so user has access to SOAP notes & advanced analytics!
      timezone: 'Asia/Kolkata',
      buffer_time_minutes: 15,
      session_durations: [30, 45, 60],
    });

    console.log(`Created Therapist: ${therapist.name} (slug: ${therapist.slug})`);

    console.log('🌱 Seeding Availability...');
    await Availability.create({
      therapist_id: therapist._id,
      timezone: 'Asia/Kolkata',
      buffer_time_minutes: 15,
      session_durations: [30, 45, 60],
      weekly_schedule: [
        { dayOfWeek: 0, dayName: 'Sunday', enabled: false, slots: [] },
        { dayOfWeek: 1, dayName: 'Monday', enabled: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
        { dayOfWeek: 2, dayName: 'Tuesday', enabled: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
        { dayOfWeek: 3, dayName: 'Wednesday', enabled: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
        { dayOfWeek: 4, dayName: 'Thursday', enabled: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
        { dayOfWeek: 5, dayName: 'Friday', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 6, dayName: 'Saturday', enabled: true, slots: [{ startTime: '10:00', endTime: '15:00' }] },
      ],
    });

    console.log('🌱 Seeding Session Packages...');
    const packages = await Package.insertMany([
      {
        therapist_id: therapist._id,
        name: '3-Session Discovery Starter',
        session_count: 3,
        total_price: 5000,
        per_session_rate: 1666.67,
        discount_percent: 7,
        validity_days: 60,
        description: 'Comprehensive initial clinical intake and foundational coping strategies.',
      },
      {
        therapist_id: therapist._id,
        name: '6-Session Healing Bundle',
        session_count: 6,
        total_price: 9500,
        per_session_rate: 1583.33,
        discount_percent: 12,
        validity_days: 120,
        description: 'Our most effective package for sustainable emotional resilience and behavioral transformation.',
      },
      {
        therapist_id: therapist._id,
        name: '12-Session Comprehensive Growth',
        session_count: 12,
        total_price: 18000,
        per_session_rate: 1500,
        discount_percent: 16,
        validity_days: 180,
        description: 'Long-term psychotherapeutic depth work for trauma, relationships, or major life transitions.',
      },
    ]);

    console.log('🌱 Seeding Clients with digital consent & intake...');
    const client1 = await Client.create({
      therapist_id: therapist._id,
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '+91 98111 22334',
      status: 'active',
      tags: ['Anxiety', 'CBT', 'Weekly'],
      intakeData: {
        date_of_birth: '1995-04-12',
        gender: 'Male',
        occupation: 'Software Engineer',
        presenting_concern: 'Persistent work burnout, cognitive fatigue, and generalized performance anxiety before team demos.',
        previous_therapy: 'Attended 4 sessions of counseling 2 years ago.',
        emergency_contact: {
          name: 'Priya Mehra',
          relationship: 'Spouse',
          phone: '+91 98111 99887',
        },
      },
      consent: {
        agreed: true,
        timestamp: new Date(Date.now() - 15 * 86400000),
        ipAddress: '103.21.244.12',
        terms_version: 'v1.0-standard-hipaa-in',
        signature_name: 'Rohan Mehra',
      },
      total_sessions_completed: 3,
      last_session_at: new Date(Date.now() - 3 * 86400000),
    });

    const client2 = await Client.create({
      therapist_id: therapist._id,
      name: 'Sneha Kapoor',
      email: 'sneha.kapoor@example.com',
      phone: '+91 99222 33445',
      status: 'active',
      tags: ['Relationships', 'Bi-weekly'],
      intakeData: {
        date_of_birth: '1992-08-25',
        gender: 'Female',
        occupation: 'Product Designer',
        presenting_concern: 'Navigating boundary setting in family relationships and interpersonal conflict resolution.',
        emergency_contact: {
          name: 'Sunita Kapoor',
          relationship: 'Mother',
          phone: '+91 99222 88776',
        },
      },
      consent: {
        agreed: true,
        timestamp: new Date(Date.now() - 25 * 86400000),
        ipAddress: '49.36.128.45',
        terms_version: 'v1.0-standard-hipaa-in',
        signature_name: 'Sneha Kapoor',
      },
      total_sessions_completed: 4,
      last_session_at: new Date(Date.now() - 5 * 86400000),
    });

    const client3 = await Client.create({
      therapist_id: therapist._id,
      name: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      phone: '+91 97333 44556',
      status: 'active',
      tags: ['Mindfulness', 'Stress'],
      intakeData: {
        presenting_concern: 'Sleep disruption, rumination, and somatic stress symptoms.',
      },
      consent: {
        agreed: true,
        timestamp: new Date(Date.now() - 8 * 86400000),
        ipAddress: '182.72.65.11',
        terms_version: 'v1.0-standard-hipaa-in',
        signature_name: 'Vikram Malhotra',
      },
      total_sessions_completed: 1,
      last_session_at: new Date(Date.now() - 2 * 86400000),
    });

    console.log('🌱 Seeding Sessions...');
    // Completed past session
    const pastSession = await Session.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      start_time: new Date(Date.now() - 3 * 86400000),
      end_time: new Date(Date.now() - 3 * 86400000 + 60 * 60000),
      duration_minutes: 60,
      status: 'completed',
      session_type: 'video',
      fee: 1800,
      payment_status: 'paid',
      meeting_link: 'https://meet.unfazed.in/session-rohan-3',
    });

    // Upcoming session tomorrow
    const upcomingSession = await Session.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      start_time: new Date(Date.now() + 24 * 3600000),
      end_time: new Date(Date.now() + 25 * 3600000),
      duration_minutes: 60,
      status: 'confirmed',
      session_type: 'video',
      fee: 1800,
      payment_status: 'paid',
      meeting_link: 'https://meet.unfazed.in/session-rohan-upcoming',
    });

    // Upcoming session for Sneha
    await Session.create({
      therapist_id: therapist._id,
      client_id: client2._id,
      start_time: new Date(Date.now() + 48 * 3600000),
      end_time: new Date(Date.now() + 49 * 3600000),
      duration_minutes: 60,
      status: 'confirmed',
      session_type: 'video',
      fee: 1800,
      payment_status: 'unpaid',
      meeting_link: 'https://meet.unfazed.in/session-sneha-upcoming',
    });

    console.log('🌱 Seeding Clinical Notes (Testing strict private vs. shared separation)...');
    // Private SOAP note (Therapist eyes only)
    await SessionNote.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      session_id: pastSession._id,
      type: 'private',
      format: 'soap',
      title: 'Session #3: Cognitive Restructuring & Thought Records',
      soapData: {
        subjective: 'Client reports feeling moderate anxiety during the workweek. Rate of panic attacks reduced from 3/week to 1/week.',
        objective: 'Client was punctual, cooperative, and maintained appropriate eye contact. Affect was slightly anxious but responsive to grounding exercises.',
        assessment: 'Generalized anxiety symptoms are improving with cognitive reframing. Automatic negative thoughts (catastrophizing) identified around deadlines.',
        plan: 'Continue daily 5-minute thought log. Review behavioral experiment on delegating tasks in next session.',
      },
      content: '<p>Private clinical observations: Client responded well to the 5-4-3-2-1 sensory grounding technique.</p>',
      tags: ['CBT', 'Panic Reduction', 'Thought Record'],
      is_pinned: true,
    });

    // Shared Client Note (Visible on client portal)
    await SessionNote.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      session_id: pastSession._id,
      type: 'shared',
      format: 'freeform',
      title: 'Weekly Takeaway & Practice Exercises',
      content: `
        <h3>Key Takeaways from Our Session</h3>
        <p>1. <strong>Notice the Thought:</strong> When feeling anxious, label the thought as an assumption rather than a verified fact.</p>
        <p>2. <strong>Box Breathing:</strong> 4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds hold before entering high-stakes meetings.</p>
        <p>3. <strong>Homework:</strong> Spend 5 minutes before bed noting one instance where an outcome went smoother than anticipated.</p>
      `,
      tags: ['Action Plan', 'Homework'],
    });

    console.log('🌱 Seeding Payments & Invoices...');
    await Payment.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      session_id: pastSession._id,
      gateway_order_id: 'order_test_sim_001',
      gateway_payment_id: 'pay_test_sim_001',
      amount: 1800,
      currency: 'INR',
      platform_fee: 36,
      net_amount: 1764,
      status: 'completed',
      invoice_number: 'UNF-2026-1001',
      tax_details: {
        gst_rate: 18,
        gst_amount: 274.58,
        is_gst_applicable: true,
      },
    });

    await Payment.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      package_id: packages[0]._id,
      gateway_order_id: 'order_test_sim_002',
      gateway_payment_id: 'pay_test_sim_002',
      amount: 5000,
      currency: 'INR',
      platform_fee: 100,
      net_amount: 4900,
      status: 'completed',
      invoice_number: 'UNF-2026-1002',
      tax_details: {
        gst_rate: 18,
        gst_amount: 762.71,
        is_gst_applicable: true,
      },
    });

    console.log('\n=============================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('-------------------------------------------------------------');
    console.log('Therapist Login Credentials:');
    console.log('  Email:    dr.ananya@unfazed.in');
    console.log('  Password: Password123!');
    console.log('  Slug:     dr-ananya-roy');
    console.log('  Public:   http://localhost:5173/dr-ananya-roy');
    console.log('Client Portal Demo:');
    console.log(`  Client ID: ${client1._id}`);
    console.log(`  Portal:    http://localhost:5173/portal/${client1._id}`);
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
