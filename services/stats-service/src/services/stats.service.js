const statsRepository = require('../repositories/stats.repository');

function normalizePeriod(period) {
  const value = String(period || 'all').trim().toLowerCase();
  return value === 'week' || value === 'month' ? value : 'all';
}

async function getLeaderboard(limit = 10, period = 'all') {
  return statsRepository.findLeaderboardByPeriod(normalizePeriod(period), limit);
}

async function getHomeSummary() {
  return statsRepository.findHomeSummary();
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

async function getMyLeaderboardRank(userId, period = 'all') {
  const row = await statsRepository.findUserLeaderboardRankByPeriod(userId, normalizePeriod(period));
  if (!row) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  return {
    rank: Number(row.leaderboard_rank || 0),
    total_score: Number(row.total_score || 0),
    total_quizzes: Number(row.total_quizzes || 0),
    average_percentage: Number(row.average_percentage || 0),
  };
}

async function getMyLeaderboardAround(userId, period = 'all', radius = 3) {
  return statsRepository.findLeaderboardAroundUser(userId, normalizePeriod(period), radius);
}

module.exports = {
  getLeaderboard,
  getHomeSummary,
  getUserDashboard,
  getMyLeaderboardRank,
  getMyLeaderboardAround,
};
