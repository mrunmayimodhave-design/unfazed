const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

/**
 * Entitlement Service — Single Source of Truth for tier-based feature gating
 * Never check tier strings directly in routes or controllers.
 */
class EntitlementService {
  /**
   * Retrieves active tier configuration for a therapist
   */
  static async getTherapistTierConfig(therapistId) {
    const therapist = await Therapist.findById(therapistId).select('subscription_tier tier_expiry');
    if (!therapist) {
      throw new Error('Therapist not found');
    }

    const tierKey = therapist.subscription_tier || 'free';
    let tierConfig = await SubscriptionTierConfig.findOne({ tier_key: tierKey, is_active: true });

    // Fallback if DB doesn't have tier populated yet
    if (!tierConfig) {
      tierConfig = {
        tier_key: tierKey,
        tier_name: tierKey.toUpperCase(),
        caps: {
          max_active_clients: tierKey === 'enterprise' ? 9999 : tierKey === 'pro' ? 25 : 5,
          max_sessions_per_month: tierKey === 'enterprise' ? 9999 : tierKey === 'pro' ? 200 : 50,
        },
        features: {
          allowed_note_templates: tierKey === 'enterprise' ? ['freeform', 'soap', 'dap'] : tierKey === 'pro' ? ['freeform', 'soap'] : ['freeform'],
          analytics_depth: tierKey === 'enterprise' ? 'full' : tierKey === 'pro' ? 'advanced' : 'basic',
          custom_branding: tierKey !== 'free',
          real_time_chat: true,
          automated_reminders: tierKey !== 'free',
          gst_invoicing: true,
          priority_support: tierKey === 'enterprise',
        },
      };
    }

    return { therapist, tierConfig };
  }

  /**
   * Check if a therapist can access a given feature or action
   * @param {string} therapistId
   * @param {string} featureKey e.g., 'ADD_CLIENT', 'NOTE_TEMPLATE_SOAP', 'NOTE_TEMPLATE_DAP', 'ANALYTICS_ADVANCED', 'CUSTOM_BRANDING'
   * @param {object} context optional context such as requested template name
   * @returns {Promise<{ allowed: boolean, reason?: string, currentUsage?: number, limit?: number, tierName?: string }>}
   */
  static async canAccess(therapistId, featureKey, context = {}) {
    const { therapist, tierConfig } = await this.getTherapistTierConfig(therapistId);
    const caps = tierConfig.caps || {};
    const features = tierConfig.features || {};

    switch (featureKey) {
      case 'ADD_CLIENT': {
        const activeClientCount = await Client.countDocuments({
          therapist_id: therapistId,
          status: { $in: ['active', 'lead'] },
        });
        const maxClients = caps.max_active_clients ?? 5;
        if (activeClientCount >= maxClients) {
          return {
            allowed: false,
            reason: `Active client cap reached (${activeClientCount}/${maxClients}). Upgrade to Pro or Enterprise for higher capacity.`,
            currentUsage: activeClientCount,
            limit: maxClients,
            tierName: tierConfig.tier_name,
            upgradeRequired: true,
          };
        }
        return { allowed: true, currentUsage: activeClientCount, limit: maxClients };
      }

      case 'NOTE_TEMPLATE': {
        const template = (context.template || 'freeform').toLowerCase();
        const allowedTemplates = features.allowed_note_templates || ['freeform'];
        if (!allowedTemplates.includes(template)) {
          return {
            allowed: false,
            reason: `The ${template.toUpperCase()} clinical note template is not available on your current plan (${tierConfig.tier_name}). Upgrade to Pro to unlock SOAP and DAP formats.`,
            allowedTemplates,
            tierName: tierConfig.tier_name,
            upgradeRequired: true,
          };
        }
        return { allowed: true, allowedTemplates };
      }

      case 'ANALYTICS_ADVANCED': {
        const depth = features.analytics_depth || 'basic';
        if (depth === 'basic') {
          return {
            allowed: false,
            reason: `Advanced revenue aggregations and predictive no-show analytics require Pro or Enterprise tier.`,
            currentDepth: depth,
            tierName: tierConfig.tier_name,
            upgradeRequired: true,
          };
        }
        return { allowed: true, currentDepth: depth };
      }

      case 'CUSTOM_BRANDING': {
        if (!features.custom_branding) {
          return {
            allowed: false,
            reason: `Custom branded domain and white-labeling require Pro tier or above.`,
            tierName: tierConfig.tier_name,
            upgradeRequired: true,
          };
        }
        return { allowed: true };
      }

      default:
        // By default check if feature flag boolean exists
        if (features[featureKey] !== undefined) {
          return {
            allowed: !!features[featureKey],
            reason: features[featureKey] ? null : `Feature ${featureKey} is not enabled on your plan.`,
            tierName: tierConfig.tier_name,
            upgradeRequired: !features[featureKey],
          };
        }
        return { allowed: true };
    }
  }

  /**
   * Get therapist subscription overview with all caps, usage, and tier status
   */
  static async getSubscriptionSummary(therapistId) {
    const { therapist, tierConfig } = await this.getTherapistTierConfig(therapistId);
    const activeClients = await Client.countDocuments({
      therapist_id: therapistId,
      status: { $in: ['active', 'lead'] },
    });

    const allTiers = await SubscriptionTierConfig.find({ is_active: true }).sort({ 'price.monthly': 1 });

    return {
      currentTier: {
        key: therapist.subscription_tier || 'free',
        name: tierConfig.tier_name,
        caps: tierConfig.caps,
        features: tierConfig.features,
        tier_expiry: therapist.tier_expiry,
      },
      usage: {
        activeClients,
        clientLimit: tierConfig.caps?.max_active_clients ?? 5,
        clientPercentage: Math.min(100, Math.round((activeClients / (tierConfig.caps?.max_active_clients || 5)) * 100)),
      },
      availableTiers: allTiers,
    };
  }
}

module.exports = EntitlementService;
