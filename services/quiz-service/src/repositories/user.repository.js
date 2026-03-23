const pool = require('../config/db');

async function createUser({ username, email, passwordHash, fullName }) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, fullName || null]
  );

  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, password_hash, is_active FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  return rows[0] || null;
}

async function updateLoginSession(userId, sessionId) {
  await pool.execute(
    'UPDATE users SET last_login_at = NOW(), current_session_id = ? WHERE id = ?',
    [sessionId, userId]
  );
}

async function clearCurrentSession(userId) {
  await pool.execute('UPDATE users SET current_session_id = NULL WHERE id = ?', [userId]);
}

async function findSessionByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT id, role, is_active, current_session_id FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  updateLoginSession,
  clearCurrentSession,
  findSessionByUserId,
};
