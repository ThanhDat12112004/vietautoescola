const pool = require('../config/db');

async function findUserSessionById(userId) {
  const [rows] = await pool.execute(
    'SELECT id, is_active, current_session_id FROM users WHERE id = ? LIMIT 1',
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
       q.code AS quiz_code,
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

module.exports = {
  findUserSessionById,
  findLeaderboard,
  findUserStats,
  findUserAttemptHistory,
};
