const pool = require('../config/db');

async function findActiveQuizById(quizId) {
  const [rows] = await pool.execute(
    'SELECT id FROM quizzes WHERE id = ? AND is_active = TRUE LIMIT 1',
    [quizId]
  );

  return rows[0] || null;
}

async function createAttempt(userId, quizId) {
  const [result] = await pool.execute(
    `INSERT INTO user_quiz_attempts (user_id, quiz_id, started_at, status)
     VALUES (?, ?, NOW(), 'in_progress')`,
    [userId, quizId]
  );

  return result.insertId;
}

async function findAttemptForSubmit(connection, attemptId, userId) {
  const [rows] = await connection.execute(
    `SELECT id, user_id, quiz_id, status
     FROM user_quiz_attempts
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [attemptId, userId]
  );

  return rows[0] || null;
}

async function findAttemptByIdAndUser(attemptId, userId) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, quiz_id, status
     FROM user_quiz_attempts
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [attemptId, userId]
  );

  return rows[0] || null;
}

async function findQuestionByIdAndQuizId(questionId, quizId) {
  const [rows] = await pool.execute(
    `SELECT id, points
     FROM questions
     WHERE id = ? AND quiz_id = ?
     LIMIT 1`,
    [questionId, quizId]
  );

  return rows[0] || null;
}

async function findCorrectAnswerForQuestion(questionId) {
  const [rows] = await pool.execute(
    `SELECT id
     FROM answers
     WHERE question_id = ? AND is_correct = TRUE
     LIMIT 1`,
    [questionId]
  );

  return rows[0] || null;
}

async function findAnswerByIdAndQuestionId(answerId, questionId) {
  const [rows] = await pool.execute(
    `SELECT id
     FROM answers
     WHERE id = ? AND question_id = ?
     LIMIT 1`,
    [answerId, questionId]
  );

  return rows[0] || null;
}

async function markAttemptCompleted(
  connection,
  { attemptId, score, percentage, correctCount, totalQuestions }
) {
  await connection.execute(
    `UPDATE user_quiz_attempts
     SET finished_at = NOW(),
         completed_at = NOW(),
         score = ?,
         percentage = ?,
         correct_count = ?,
         total_questions = ?,
         status = 'completed'
     WHERE id = ?`,
    [score, percentage, correctCount, totalQuestions, attemptId]
  );
}

async function upsertUserAnswer(
  connection,
  { attemptId, questionId, selectedAnswerId, isCorrect, pointsEarned }
) {
  await connection.execute(
    `INSERT INTO user_answers (attempt_id, question_id, selected_answer_id, is_correct, points_earned)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       selected_answer_id = VALUES(selected_answer_id),
       is_correct = VALUES(is_correct),
       points_earned = VALUES(points_earned)`,
    [attemptId, questionId, selectedAnswerId, isCorrect, pointsEarned]
  );
}

async function refreshUserStats(connection, userId) {
  await connection.execute(
    `UPDATE users u
     JOIN (
       SELECT
         user_id,
         COALESCE(SUM(score), 0) AS total_score,
         COUNT(*) AS total_quizzes,
         COALESCE(SUM(correct_count), 0) AS total_correct,
         COALESCE(SUM(total_questions), 0) AS total_questions,
         COALESCE(AVG(percentage), 0) AS average_percentage
       FROM user_quiz_attempts
       WHERE user_id = ? AND status = 'completed'
       GROUP BY user_id
     ) t ON t.user_id = u.id
     SET u.total_score = t.total_score,
         u.total_quizzes = t.total_quizzes,
         u.total_correct = t.total_correct,
         u.total_questions = t.total_questions,
         u.average_percentage = t.average_percentage
     WHERE u.id = ?`,
    [userId, userId]
  );
}

async function getConnection() {
  return pool.getConnection();
}

module.exports = {
  findActiveQuizById,
  createAttempt,
  findAttemptForSubmit,
  findAttemptByIdAndUser,
  findQuestionByIdAndQuizId,
  findCorrectAnswerForQuestion,
  findAnswerByIdAndQuestionId,
  markAttemptCompleted,
  upsertUserAnswer,
  refreshUserStats,
  getConnection,
};
