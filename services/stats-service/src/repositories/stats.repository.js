const pool = require('../config/db');

async function findUserSessionById(userId) {
  const [rows] = await pool.execute(
    'SELECT id, role, is_active, current_session_id FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  return rows[0] || null;
}

async function findLeaderboard(limit = 20) {
  const [rows] = await pool.query(
    `SELECT
       id,
       username,
       full_name,
       avatar_url,
       total_score,
       total_quizzes,
       total_correct,
       total_questions,
       average_percentage
     FROM users
     WHERE is_active = TRUE
     ORDER BY total_score DESC, average_percentage DESC, total_correct DESC
     LIMIT ?`,
    [limit]
  );

  return rows;
}

function normalizePeriod(period) {
  const value = String(period || 'all').trim().toLowerCase();
  if (value === 'week' || value === 'month') return value;
  return 'all';
}

function getPeriodStartDate(period) {
  const now = new Date();
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start;
  }
  if (period === 'month') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return start;
  }
  return null;
}

async function findLeaderboardByPeriod(period = 'all', limit = 20) {
  const safePeriod = normalizePeriod(period);
  if (safePeriod === 'all') {
    return findLeaderboard(limit);
  }

  const startDate = getPeriodStartDate(safePeriod);
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.username,
       u.full_name,
       u.avatar_url,
       ROUND(COALESCE(SUM(a.score), 0), 1) AS total_score,
       COUNT(a.id) AS total_quizzes,
       COALESCE(SUM(a.correct_count), 0) AS total_correct,
       COALESCE(SUM(a.total_questions), 0) AS total_questions,
       CASE
         WHEN COALESCE(SUM(a.total_questions), 0) > 0
           THEN ROUND((COALESCE(SUM(a.correct_count), 0) / COALESCE(SUM(a.total_questions), 0)) * 100, 1)
         ELSE 0
       END AS average_percentage
     FROM users u
     LEFT JOIN user_quiz_attempts a
       ON a.user_id = u.id
      AND a.status = 'completed'
      AND a.completed_at >= ?
     WHERE u.is_active = TRUE
     GROUP BY u.id, u.username, u.full_name, u.avatar_url
     HAVING COUNT(a.id) > 0
     ORDER BY total_score DESC, average_percentage DESC, total_correct DESC
     LIMIT ?`,
    [startDate, limit]
  );

  return rows;
}

async function findHomeSummary() {
  const [[questionsRow]] = await pool.query(`SELECT COUNT(*) AS total_questions FROM questions`);

  const [[studentsRow]] = await pool.query(
    `SELECT COUNT(*) AS total_students
     FROM users
     WHERE is_active = TRUE AND role = 'student'`
  );

  const [[attemptsRow]] = await pool.query(
    `SELECT
       COUNT(*) AS total_completed,
       SUM(CASE WHEN a.percentage >= q.passing_score THEN 1 ELSE 0 END) AS total_passed
     FROM user_quiz_attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.status = 'completed'`
  );

  const totalCompleted = Number(attemptsRow.total_completed || 0);
  const totalPassed = Number(attemptsRow.total_passed || 0);
  const passRate =
    totalCompleted > 0 ? Number(((totalPassed / totalCompleted) * 100).toFixed(1)) : 0;

  return {
    total_questions: Number(questionsRow.total_questions || 0),
    total_students: Number(studentsRow.total_students || 0),
    pass_rate: passRate,
    total_attempts: totalCompleted,
  };
}

async function findUserStats(userId) {
  const [rows] = await pool.query(
    `SELECT
       id,
       username,
       full_name,
       avatar_url,
       total_score,
       total_quizzes,
       total_correct,
       total_questions,
       average_percentage
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findUserAttemptHistory(userId, lang, limit = 30) {
  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.quiz_id,
       CAST(a.quiz_id AS CHAR) AS quiz_code,
       q.${lang === 'es' ? 'title_es' : 'title_vi'} AS quiz_title,
       a.score,
       a.percentage,
       a.correct_count,
       a.total_questions,
       a.status,
       a.started_at,
       a.completed_at
     FROM user_quiz_attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.user_id = ?
     ORDER BY COALESCE(a.completed_at, a.started_at) DESC
     LIMIT ?`,
    [userId, limit]
  );

  return rows;
}

/** Thứ hạng global (1 = cao nhất), cùng logic sắp xếp với findLeaderboard */
async function findUserLeaderboardRank(userId) {
  const [[row]] = await pool.query(
    `SELECT
       (
         SELECT COUNT(*)
         FROM users u2
         WHERE u2.is_active = TRUE
           AND (
             u2.total_score > u.total_score
             OR (
               u2.total_score = u.total_score
               AND u2.average_percentage > u.average_percentage
             )
             OR (
               u2.total_score = u.total_score
               AND u2.average_percentage = u.average_percentage
               AND u2.total_correct > u.total_correct
             )
           )
       ) + 1 AS leaderboard_rank,
       u.total_score,
       u.total_quizzes,
       u.average_percentage
     FROM users u
     WHERE u.id = ? AND u.is_active = TRUE
     LIMIT 1`,
    [userId]
  );

  return row || null;
}

async function findUserLeaderboardRankByPeriod(userId, period = 'all') {
  const safePeriod = normalizePeriod(period);
  if (safePeriod === 'all') {
    return findUserLeaderboardRank(userId);
  }

  const startDate = getPeriodStartDate(safePeriod);
  const [[target]] = await pool.query(
    `SELECT
       u.id,
       ROUND(COALESCE(SUM(a.score), 0), 1) AS total_score,
       COUNT(a.id) AS total_quizzes,
       COALESCE(SUM(a.correct_count), 0) AS total_correct,
       CASE
         WHEN COALESCE(SUM(a.total_questions), 0) > 0
           THEN ROUND((COALESCE(SUM(a.correct_count), 0) / COALESCE(SUM(a.total_questions), 0)) * 100, 1)
         ELSE 0
       END AS average_percentage
     FROM users u
     LEFT JOIN user_quiz_attempts a
       ON a.user_id = u.id
      AND a.status = 'completed'
      AND a.completed_at >= ?
     WHERE u.id = ? AND u.is_active = TRUE
     GROUP BY u.id`,
    [startDate, userId]
  );

  if (!target || Number(target.total_quizzes || 0) <= 0) return null;

  const [[rankRow]] = await pool.query(
    `SELECT
       COUNT(*) + 1 AS leaderboard_rank
     FROM (
       SELECT
         u.id,
         ROUND(COALESCE(SUM(a.score), 0), 1) AS total_score,
         COALESCE(SUM(a.correct_count), 0) AS total_correct,
         CASE
           WHEN COALESCE(SUM(a.total_questions), 0) > 0
             THEN ROUND((COALESCE(SUM(a.correct_count), 0) / COALESCE(SUM(a.total_questions), 0)) * 100, 1)
           ELSE 0
         END AS average_percentage,
         COUNT(a.id) AS total_quizzes
       FROM users u
       LEFT JOIN user_quiz_attempts a
         ON a.user_id = u.id
        AND a.status = 'completed'
        AND a.completed_at >= ?
       WHERE u.is_active = TRUE
       GROUP BY u.id
       HAVING COUNT(a.id) > 0
     ) x
     WHERE
       x.total_score > ?
       OR (x.total_score = ? AND x.average_percentage > ?)
       OR (x.total_score = ? AND x.average_percentage = ? AND x.total_correct > ?)`,
    [
      startDate,
      Number(target.total_score || 0),
      Number(target.total_score || 0),
      Number(target.average_percentage || 0),
      Number(target.total_score || 0),
      Number(target.average_percentage || 0),
      Number(target.total_correct || 0),
    ]
  );

  return {
    leaderboard_rank: Number(rankRow?.leaderboard_rank || 0),
    total_score: Number(target.total_score || 0),
    total_quizzes: Number(target.total_quizzes || 0),
    average_percentage: Number(target.average_percentage || 0),
  };
}

async function findLeaderboardAroundUser(userId, period = 'all', radius = 3) {
  const safePeriod = normalizePeriod(period);
  const safeRadius = Math.min(Math.max(Number(radius || 3), 1), 10);
  const poolLimit = 500;
  const rows = await findLeaderboardByPeriod(safePeriod, poolLimit);
  const idx = rows.findIndex((item) => Number(item.id) === Number(userId));
  if (idx < 0) return [];
  const start = Math.max(0, idx - safeRadius);
  const end = Math.min(rows.length, idx + safeRadius + 1);
  return rows.slice(start, end).map((item, index) => ({
    ...item,
    rank: start + index + 1,
  }));
}

module.exports = {
  findUserSessionById,
  findLeaderboard,
  findLeaderboardByPeriod,
  findHomeSummary,
  findUserStats,
  findUserAttemptHistory,
  findUserLeaderboardRank,
  findUserLeaderboardRankByPeriod,
  findLeaderboardAroundUser,
};
