const mongoose = require('mongoose');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const EntitlementService = require('../services/entitlementService');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Practice analytics overview computed via MongoDB Aggregation Pipelines
 * @access  Private
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.therapist._id);

    // 1. Check analytics depth entitlement
    const access = await EntitlementService.canAccess(req.therapist._id, 'ANALYTICS_ADVANCED');
    const isAdvancedAllowed = access.allowed;

    // 2. High-level metric counts
    const activeClientsCount = await Client.countDocuments({
      therapist_id: therapistId,
      status: 'active',
    });

    const totalSessionsCount = await Session.countDocuments({
      therapist_id: therapistId,
    });

    // 3. MongoDB Aggregation: Session status breakdown (completed, cancelled, no-show)
    const sessionStatusBreakdown = await Session.aggregate([
      { $match: { therapist_id: therapistId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let completedSessions = 0;
    let cancelledSessions = 0;
    let noShowSessions = 0;

    sessionStatusBreakdown.forEach((item) => {
      if (item._id === 'completed') completedSessions = item.count;
      if (item._id === 'cancelled') cancelledSessions = item.count;
      if (item._id === 'no_show') noShowSessions = item.count;
    });

    const noShowRate = totalSessionsCount > 0 ? +((noShowSessions / totalSessionsCount) * 100).toFixed(1) : 0;
    const completionRate = totalSessionsCount > 0 ? +((completedSessions / totalSessionsCount) * 100).toFixed(1) : 0;

    // 4. MongoDB Aggregation: Total practice revenue & net earnings
    const revenueAggregation = await Payment.aggregate([
      {
        $match: {
          therapist_id: therapistId,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalNet: { $sum: '$net_amount' },
          totalPlatformFees: { $sum: '$platform_fee' },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const netEarnings = revenueAggregation[0]?.totalNet || 0;

    // 5. MongoDB Aggregation: Monthly revenue trend (last 6-12 months)
    const revenueTrend = await Payment.aggregate([
      {
        $match: {
          therapist_id: therapistId,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          net: { $sum: '$net_amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          monthName: {
            $concat: [
              {
                $arrayElemAt: [
                  ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
          revenue: 1,
          net: 1,
          count: 1,
        },
      },
    ]);

    // 6. MongoDB Aggregation: Client Acquisition Trend (last 6 months)
    const clientAcquisitionTrend = await Client.aggregate([
      { $match: { therapist_id: therapistId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newClients: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  '$_id.month',
                ],
              },
            ],
          },
          newClients: 1,
        },
      },
    ]);

    // 7. Advanced depth aggregations: Day of week load distribution
    let dayOfWeekDistribution = [];
    if (isAdvancedAllowed) {
      dayOfWeekDistribution = await Session.aggregate([
        { $match: { therapist_id: therapistId } },
        {
          $group: {
            _id: { $dayOfWeek: '$start_time' }, // 1: Sun, 2: Mon...
            sessionCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            day: {
              $arrayElemAt: [['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], '$_id'],
            },
            sessionCount: 1,
          },
        },
      ]);
    }

    res.json({
      success: true,
      analytics: {
        summary: {
          totalRevenue,
          netEarnings,
          activeClientsCount,
          totalSessionsCount,
          noShowRate,
          completionRate,
          completedSessions,
          cancelledSessions,
          noShowSessions,
        },
        revenueTrend: revenueTrend.length > 0 ? revenueTrend : [
          { monthName: 'Recent', revenue: totalRevenue, net: netEarnings, count: 1 }
        ],
        clientAcquisitionTrend,
        dayOfWeekDistribution,
        isAdvancedAllowed,
        tierName: req.therapist.subscription_tier,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
