const Lead = require('../models/Lead');
const Client = require('../models/Client');
const notificationService = require('./notificationService');
const EntitlementService = require('./entitlementService');

class LeadDistributionService {
  /**
   * Records a prospective client lead from therapist's public link
   */
  static async captureLead(therapist, leadData) {
    const lead = await Lead.create({
      therapist_id: therapist._id,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || '',
      message: leadData.message || '',
      preferred_time: leadData.preferred_time || '',
      source: leadData.source || 'branded_profile',
    });

    // Notify therapist about new lead
    await notificationService.sendEmail({
      to: therapist.email,
      subject: `New Practice Inquiry: ${lead.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>New Client Inquiry via your Branded Link</h3>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
          <p><strong>Message:</strong> ${lead.message || 'No additional message'}</p>
          <p>Log in to Unfazed to respond or convert this lead into an active client.</p>
        </div>
      `,
    });

    return lead;
  }

  /**
   * Convert an existing lead to a full Client record
   */
  static async convertLeadToClient(therapistId, leadId) {
    // Check entitlement first
    const canAdd = await EntitlementService.canAccess(therapistId, 'ADD_CLIENT');
    if (!canAdd.allowed) {
      throw new Error(canAdd.reason);
    }

    const lead = await Lead.findOne({ _id: leadId, therapist_id: therapistId });
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Check if client already exists
    let client = await Client.findOne({ therapist_id: therapistId, email: lead.email });
    if (!client) {
      client = await Client.create({
        therapist_id: therapistId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: 'active',
        tags: ['Converted Lead'],
        intakeData: {
          presenting_concern: lead.message || '',
        },
      });
    }

    lead.status = 'converted';
    await lead.save();

    return { client, lead };
  }
}

module.exports = LeadDistributionService;
