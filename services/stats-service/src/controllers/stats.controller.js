const statsService = require('../services/stats.service');
const { getLang } = require('../utils/lang');

async function getLeaderboard(req, res, next) {
  try {
    const limitParam = Number(req.query.limit || 10);
    const limit = Number.isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 100);
    const data = await statsService.getLeaderboard(limit);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getSummary(_req, res, next) {
  try {
    const data = await statsService.getHomeSummary();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMyDashboard(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const data = await statsService.getUserDashboard(req.user.id, lang);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getUserDashboard(req, res, next) {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const isOwner = userId === req.user.id;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const lang = getLang(req.query.lang);
    const data = await statsService.getUserDashboard(userId, lang);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getLeaderboard, getSummary, getMyDashboard, getUserDashboard };
