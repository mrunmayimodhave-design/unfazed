const EntitlementService = require('../services/entitlementService');

/**
 * Express middleware to gate a route by feature key via the centralized EntitlementService
 * @param {string} featureKey e.g. 'ADD_CLIENT', 'NOTE_TEMPLATE', 'ANALYTICS_ADVANCED'
 * @param {function} contextExtractor optional callback (req) => context object
 */
const requireEntitlement = (featureKey, contextExtractor = null) => {
  return async (req, res, next) => {
    try {
      const therapistId = req.therapistId || req.therapist?._id;
      if (!therapistId) {
        return res.status(401).json({ success: false, message: 'Authentication required for entitlement check' });
      }

      const context = contextExtractor ? contextExtractor(req) : req.body || {};
      const entitlement = await EntitlementService.canAccess(therapistId, featureKey, context);

      if (!entitlement.allowed) {
        return res.status(403).json({
          success: false,
          upgradeRequired: true,
          message: entitlement.reason || 'This feature is locked on your current plan.',
          featureKey,
          tierName: entitlement.tierName,
          limit: entitlement.limit,
          currentUsage: entitlement.currentUsage,
        });
      }

      req.entitlement = entitlement;
      next();
    } catch (error) {
      console.error(`Entitlement check error for [${featureKey}]:`, error.message);
      return res.status(500).json({ success: false, message: 'Failed to verify feature entitlement' });
    }
  };
};

module.exports = { requireEntitlement };
