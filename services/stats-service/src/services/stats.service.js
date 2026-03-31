const statsRepository = require('../repositories/stats.repository');

async function getLeaderboard(limit = 10) {
  return statsRepository.findLeaderboard(limit);
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

async function getMyLeaderboardRank(userId) {
  const row = await statsRepository.findUserLeaderboardRank(userId);
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

module.exports = { getLeaderboard, getHomeSummary, getUserDashboard, getMyLeaderboardRank };
