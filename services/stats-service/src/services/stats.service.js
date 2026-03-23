const statsRepository = require('../repositories/stats.repository');

async function getLeaderboard(limit = 20) {
  return statsRepository.findLeaderboard(limit);
}

async function getUserDashboard(userId, lang) {
  const stats = await statsRepository.findUserStats(userId);

  if (!stats) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  const history = await statsRepository.findUserAttemptHistory(userId, lang, 30);
  return { stats, history };
}

module.exports = { getLeaderboard, getUserDashboard };
