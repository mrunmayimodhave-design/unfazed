import { useAuth } from '../context/AuthContext';

export const useEntitlement = () => {
  const { entitlement, therapist, openUpgradeModal, refreshEntitlement } = useAuth();

  const currentTierKey = entitlement?.currentTier?.key || therapist?.subscription_tier || 'free';
  const tierName = entitlement?.currentTier?.name || currentTierKey.toUpperCase();
  const caps = entitlement?.currentTier?.caps || { max_active_clients: 5 };
  const features = entitlement?.currentTier?.features || {
    allowed_note_templates: ['freeform'],
    analytics_depth: 'basic',
    custom_branding: false,
    real_time_chat: true,
  };
  const usage = entitlement?.usage || {
    activeClients: 0,
    clientLimit: caps.max_active_clients || 5,
    clientPercentage: 0,
  };

  /**
   * Check if a clinical note template is allowed
   */
  const isTemplateAllowed = (template = 'freeform') => {
    const allowed = features.allowed_note_templates || ['freeform'];
    return allowed.includes(template.toLowerCase());
  };

  /**
   * Check if active client cap is reached
   */
  const isClientCapReached = () => {
    return usage.activeClients >= usage.clientLimit;
  };

  /**
   * Check if advanced analytics are unlocked
   */
  const hasAdvancedAnalytics = () => {
    return features.analytics_depth === 'advanced' || features.analytics_depth === 'full';
  };

  /**
   * Convenience trigger to open the upgrade modal with context
   */
  const promptUpgrade = (featureName, description) => {
    openUpgradeModal({
      featureName,
      description: description || `Unlock ${featureName} and scale your clinical practice with Unfazed Pro.`,
      currentTier: tierName,
    });
  };

  return {
    tierKey: currentTierKey,
    tierName,
    caps,
    features,
    usage,
    isTemplateAllowed,
    isClientCapReached,
    hasAdvancedAnalytics,
    promptUpgrade,
    refreshEntitlement,
  };
};

export default useEntitlement;
