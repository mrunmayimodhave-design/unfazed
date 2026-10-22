const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.whatsAppQueue = [];
    this.transporter = null;
    this.initEmailTransporter();
  }

  async initEmailTransporter() {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const isGmail =
          (process.env.EMAIL_HOST || '').toLowerCase().includes('gmail') ||
          (process.env.EMAIL_USER || '').toLowerCase().endsWith('@gmail.com');

        if (isGmail) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 5000,
          });
        } else {
          this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.EMAIL_PORT, 10) || 587,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 5000,
          });
        }
      } else {
        // Ethereal test account or simulated logging
        const testAccount = await nodemailer.createTestAccount().catch(() => null);
        if (testAccount) {
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 5000,
          });
        }
      }
    } catch (err) {
      console.warn('Email transporter init skipped/fallback to console log:', err.message);
    }
  }

  /**
   * Stubbed WhatsApp messaging layer (queue + event logging)
   */
  async sendWhatsAppMessage({ to, templateName, params }) {
    const queueItem = {
      id: `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      to,
      templateName,
      params,
      timestamp: new Date().toISOString(),
      status: 'queued_and_logged',
    };

    this.whatsAppQueue.push(queueItem);
    console.log(`\n📱 [WhatsApp Stubbed Event] -> To: ${to} | Template: ${templateName}`);
    console.log(`   Data:`, JSON.stringify(params, null, 2));

    return queueItem;
  }

  /**
   * Dispatches email via Nodemailer or logs safely
   */
  async sendEmail({ to, subject, html, text }) {
    console.log(`\n📧 [Email Event] -> To: ${to} | Subject: "${subject}"`);
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Unfazed Therapy" <no-reply@unfazed.in>`,
          to,
          subject,
          text: text || subject,
          html,
        });
        console.log(`   Message sent: ${info.messageId}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`   Preview URL: ${previewUrl}`);
        }
        return info;
      } catch (err) {
        console.warn(`   Email dispatch error (${err.message})`);
      }
    }
    return { status: 'logged_to_console', to, subject };
  }

  // Domain Event Handlers

  async onBookingConfirmed({ client, therapist, session }) {
    const sessionDate = new Date(session.start_time).toLocaleString('en-IN', {
      timeZone: therapist.timezone || 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // 1. WhatsApp notification (stubbed)
    await this.sendWhatsAppMessage({
      to: client.phone || '+91 99999 99999',
      templateName: 'booking_confirmed',
      params: {
        clientName: client.name,
        therapistName: therapist.name,
        sessionDate,
        meetingLink: session.meeting_link || `https://meet.unfazed.in/${session._id}`,
      },
    });

    // 2. Email confirmation to Client
    await this.sendEmail({
      to: client.email,
      subject: `Booking Confirmed: Therapy Session with ${therapist.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0d9488;">Session Confirmed!</h2>
          <p>Hello <strong>${client.name}</strong>,</p>
          <p>Your therapy session with <strong>${therapist.name}</strong> has been successfully booked.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${sessionDate}</p>
            <p style="margin: 4px 0;"><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
            <p style="margin: 4px 0;"><strong>Meeting Link:</strong> <a href="${session.meeting_link || 'https://meet.unfazed.in/' + session._id}">${session.meeting_link || 'Join Video Session'}</a></p>
          </div>
          <p>Warm regards,<br>The Unfazed Practice Team</p>
        </div>
      `,
    });

    // 3. Email notification to Therapist
    await this.sendEmail({
      to: therapist.email,
      subject: `New Appointment Booked: ${client.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0d9488;">New Session Booked</h2>
          <p>Hello <strong>${therapist.name}</strong>,</p>
          <p>Client <strong>${client.name}</strong> has booked a ${session.duration_minutes}-minute session for <strong>${sessionDate}</strong>.</p>
          <p>View your dashboard to review intake documents and session details.</p>
        </div>
      `,
    });
  }

  async on24hReminder({ client, therapist, session }) {
    await this.sendWhatsAppMessage({
      to: client.phone,
      templateName: 'session_24h_reminder',
      params: {
        clientName: client.name,
        sessionTime: new Date(session.start_time).toLocaleTimeString(),
      },
    });
  }

  async onPaymentReceived({ client, therapist, payment, invoiceNumber }) {
    await this.sendEmail({
      to: client.email,
      subject: `Payment Receipt: ${invoiceNumber} - Unfazed`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #0d9488;">Payment Successful</h3>
          <p>Dear ${client.name}, we received your payment of ₹${payment.amount}.</p>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p>You can download your GST invoice from your Client Portal.</p>
        </div>
      `,
    });
  }

  getStubbedQueue() {
    return this.whatsAppQueue;
  }
}

module.exports = new NotificationService();
