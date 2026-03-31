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

module.exports = {
  findUserSessionById,
  findLeaderboard,
  findHomeSummary,
  findUserStats,
  findUserAttemptHistory,
  findUserLeaderboardRank,
};
