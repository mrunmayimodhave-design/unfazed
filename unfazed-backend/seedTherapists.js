require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Therapist = require('./src/models/Therapist');
const Availability = require('./src/models/Availability');
const Package = require('./src/models/Package');
const { connectDB } = require('./src/config/db');

const additionalTherapists = [
  {
    name: 'Dr. Siddharth Verma',
    email: 'dr.siddharth@unfazed.in',
    slug: 'dr-siddharth-verma',
    title: 'Consultant Psychiatrist & Neuropsychiatrist',
    bio: 'Specializing in evidence-based psychopharmacology, clinical depression, adult ADHD assessments, and integrated psychiatric care with over 11 years of tertiary hospital experience.',
    specializations: [
      'Depression & Mood Disorders',
      'Adult ADHD',
      'Anxiety & Panic Disorders',
      'Sleep Medicine',
      'Psychopharmacology',
    ],
    languages: ['English', 'Hindi', 'Punjabi'],
    phone: '+91 98222 33445',
    hourly_rate: 2200,
    currency: 'INR',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    cover_image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    qualifications: ['M.D. Psychiatry (AIIMS New Delhi)', 'DPM (NIMHANS)'],
    years_of_experience: 11,
    subscription_tier: 'enterprise',
    timezone: 'Asia/Kolkata',
    buffer_time_minutes: 15,
    session_durations: [30, 45, 60],
  },
  {
    name: 'Pooja Nair, M.Sc.',
    email: 'pooja.nair@unfazed.in',
    slug: 'pooja-nair',
    title: 'Counseling Psychologist & Relationship Expert',
    bio: 'Empathetic guidance for couples, pre-marital counseling, emotional regulation, and life stage transitions using Emotionally Focused Therapy (EFT) and systemic relationship frameworks.',
    specializations: [
      'Couples & Relationship Counseling',
      'Pre-Marital Counseling',
      'Grief & Bereavement',
      'Emotional Regulation',
      'Life Transitions',
    ],
    languages: ['English', 'Hindi', 'Malayalam'],
    phone: '+91 98333 44556',
    hourly_rate: 1500,
    currency: 'INR',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    cover_image: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1200&q=80',
    qualifications: ['M.Sc. Counseling Psychology (TISS Mumbai)', 'Certified EFT Practitioner'],
    years_of_experience: 6,
    subscription_tier: 'pro',
    timezone: 'Asia/Kolkata',
    buffer_time_minutes: 15,
    session_durations: [45, 60],
  },
  {
    name: 'Dr. Farhan Qureshi',
    email: 'dr.farhan@unfazed.in',
    slug: 'dr-farhan-qureshi',
    title: 'Trauma & Somatic Psychotherapist',
    bio: 'Pioneering somatic experiencing and EMDR trauma therapy in India. Safe, grounded space to resolve developmental trauma, grief, PTSD, and psychosomatic tension.',
    specializations: [
      'Trauma & PTSD Recovery',
      'Somatic Experiencing',
      'EMDR Therapy',
      'Mindfulness-Based Stress Reduction',
      'Chronic Stress',
    ],
    languages: ['English', 'Hindi', 'Urdu'],
    phone: '+91 98444 55667',
    hourly_rate: 2000,
    currency: 'INR',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    cover_image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    qualifications: ['Ph.D. in Clinical Psychology (CIP Ranchi)', 'EMDR Certified (EMDRIA)'],
    years_of_experience: 9,
    subscription_tier: 'pro',
    timezone: 'Asia/Kolkata',
    buffer_time_minutes: 15,
    session_durations: [60],
  },
  {
    name: 'Meera Iyer, M.A.',
    email: 'meera.iyer@unfazed.in',
    slug: 'meera-iyer',
    title: 'Child, Adolescent & Family Psychologist',
    bio: 'Dedicated to helping adolescents and young adults navigate academic pressure, ADHD, behavioral challenges, and healthy family dynamics through gentle CBT and play therapy techniques.',
    specializations: [
      'Adolescent & Young Adult Therapy',
      'Academic & Exam Anxiety',
      'Parenting & Family Guidance',
      'Self-Esteem & Identity',
      'Cognitive Behavioral Therapy (CBT)',
    ],
    languages: ['English', 'Hindi', 'Tamil'],
    phone: '+91 98555 66778',
    hourly_rate: 1600,
    currency: 'INR',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    cover_image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80',
    qualifications: ['M.A. Applied Psychology (Delhi University)', 'PG Diploma in Guidance & Counseling'],
    years_of_experience: 7,
    subscription_tier: 'pro',
    timezone: 'Asia/Kolkata',
    buffer_time_minutes: 15,
    session_durations: [45, 60],
  },
];

async function seedAdditionalTherapists() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('Password123!', salt);

    for (const tData of additionalTherapists) {
      let therapist = await Therapist.findOne({ slug: tData.slug });
      if (!therapist) {
        therapist = await Therapist.create({
          ...tData,
          password_hash,
          is_active: true,
        });
        console.log(`✅ Created Therapist: ${therapist.name} (/${therapist.slug})`);

        // Create availability schedule
        await Availability.create({
          therapist_id: therapist._id,
          timezone: 'Asia/Kolkata',
          buffer_time_minutes: 15,
          session_durations: tData.session_durations,
          weekly_schedule: [
            { dayOfWeek: 0, dayName: 'Sunday', enabled: false, slots: [] },
            { dayOfWeek: 1, dayName: 'Monday', enabled: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
            { dayOfWeek: 2, dayName: 'Tuesday', enabled: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
            { dayOfWeek: 3, dayName: 'Wednesday', enabled: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
            { dayOfWeek: 4, dayName: 'Thursday', enabled: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
            { dayOfWeek: 5, dayName: 'Friday', enabled: true, slots: [{ startTime: '10:00', endTime: '17:00' }] },
            { dayOfWeek: 6, dayName: 'Saturday', enabled: true, slots: [{ startTime: '10:00', endTime: '14:00' }] },
          ],
        });

        // Create standard package
        await Package.create({
          therapist_id: therapist._id,
          name: '3-Session Discovery Bundle',
          session_count: 3,
          total_price: Math.round(tData.hourly_rate * 3 * 0.9),
          per_session_rate: Math.round(tData.hourly_rate * 0.9),
          discount_percent: 10,
          validity_days: 60,
          description: `Foundational intake and focused therapeutic guidance with ${therapist.name}.`,
          is_active: true,
        });
      } else {
        console.log(`ℹ️ Therapist ${tData.name} already exists.`);
      }
    }

    console.log('\n🎉 All therapists seeded successfully into MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAdditionalTherapists();
