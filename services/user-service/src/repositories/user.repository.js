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
    'SELECT id, username, email, role, password_hash, is_active, current_session_id, session_last_seen_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  return rows[0] || null;
}

async function updateLoginSession(userId, sessionId) {
  await pool.execute(
    'UPDATE users SET last_login_at = NOW(), current_session_id = ?, session_last_seen_at = NOW() WHERE id = ?',
    [sessionId, userId]
  );
}

async function clearCurrentSession(userId) {
  await pool.execute('UPDATE users SET current_session_id = NULL, session_last_seen_at = NULL WHERE id = ?', [userId]);
}

async function findSessionByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT id, role, is_active, current_session_id, session_last_seen_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  return rows[0] || null;
}

async function touchCurrentSession(userId, sessionId) {
  const [result] = await pool.execute(
    'UPDATE users SET session_last_seen_at = NOW() WHERE id = ? AND current_session_id = ?',
    [userId, sessionId]
  );

  return result.affectedRows;
}

async function findAllUsers() {
  const [rows] = await pool.query(
    `SELECT
      id,
      username,
      email,
      role,
      full_name,
      is_active,
      last_login_at,
      created_at
     FROM users
     ORDER BY created_at DESC`
  );

  return rows;
}

async function findUserById(userId) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, role, full_name, is_active
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function createUserByAdmin({ username, email, passwordHash, fullName, role, isActive }) {
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, role, full_name, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, email, passwordHash, role, fullName || null, !!isActive]
  );

  return result.insertId;
}

async function updateUserByAdmin(userId, payload) {
  if (payload.passwordHash) {
    await pool.execute(
      `UPDATE users
       SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?, password_hash = ?,
           current_session_id = CASE WHEN ? = FALSE THEN NULL ELSE current_session_id END
       WHERE id = ?`,
      [
        payload.username,
        payload.email,
        payload.fullName || null,
        payload.role,
        !!payload.isActive,
        payload.passwordHash,
        !!payload.isActive,
        userId,
      ]
    );
    return;
  }

  await pool.execute(
    `UPDATE users
     SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?,
         current_session_id = CASE WHEN ? = FALSE THEN NULL ELSE current_session_id END
     WHERE id = ?`,
    [
      payload.username,
      payload.email,
      payload.fullName || null,
      payload.role,
      !!payload.isActive,
      !!payload.isActive,
      userId,
    ]
  );
}

async function deleteUserById(userId) {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
  return result.affectedRows;
}

async function setUserLock(userId, locked) {
  const [result] = await pool.execute(
    `UPDATE users
     SET is_active = ?, current_session_id = CASE WHEN ? = TRUE THEN NULL ELSE current_session_id END
     WHERE id = ?`,
    [!locked, !!locked, userId]
  );

  return result.affectedRows;
}

module.exports = {
  createUser,
  findUserByEmail,
  updateLoginSession,
  clearCurrentSession,
  findSessionByUserId,
  findAllUsers,
  findUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserById,
  setUserLock,
  touchCurrentSession,
};
