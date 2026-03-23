const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createHash, randomUUID } = require('crypto');

const userRepository = require('../repositories/user.repository');

const SESSION_STALE_SECONDS = Number(process.env.SESSION_STALE_SECONDS || 45);

if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
  throw new Error('Missing JWT_SECRET or JWT_EXPIRES_IN in environment');
}

async function register(payload) {
  const passwordHash = await bcrypt.hash(payload.password, 10);

  try {
    const id = await userRepository.createUser({
      username: payload.username,
      email: payload.email,
      passwordHash,
      fullName: payload.full_name,
    });

    return { id, username: payload.username, email: payload.email };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Username or email already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function login(payload) {
  const user = await userRepository.findUserByEmail(payload.email);

  if (!user) {
    const appError = new Error('Invalid credentials');
    appError.status = 401;
    throw appError;
  }

  if (!user.is_active) {
    const appError = new Error('Account is disabled');
    appError.status = 403;
    throw appError;
  }

  const valid = await bcrypt.compare(payload.password, user.password_hash);
  if (!valid) {
    const appError = new Error('Invalid credentials');
    appError.status = 401;
    throw appError;
  }

  const deviceId = String(payload.device_id || '').trim();
  if (!deviceId) {
    const appError = new Error('Missing device id');
    appError.status = 400;
    throw appError;
  }

  const deviceKey = createHash('sha256').update(deviceId).digest('hex').slice(0, 16);
  const existingSessionId = String(user.current_session_id || '');
  const existingDeviceKey = existingSessionId.includes('.') ? existingSessionId.split('.')[0] : null;
  const lastSeenAt = user.session_last_seen_at ? new Date(user.session_last_seen_at) : null;
  const sessionIsFresh =
    lastSeenAt instanceof Date
    && !Number.isNaN(lastSeenAt.getTime())
    && (Date.now() - lastSeenAt.getTime()) <= SESSION_STALE_SECONDS * 1000;

  if (existingSessionId && existingDeviceKey && existingDeviceKey !== deviceKey && sessionIsFresh) {
    const appError = new Error('Account is already logged in on another device');
    appError.status = 409;
    throw appError;
  }

  const sid = `${deviceKey}.${randomUUID().replace(/-/g, '')}`;
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role, sid },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  await userRepository.updateLoginSession(user.id, sid);

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  };
}

async function logout(userId) {
  await userRepository.clearCurrentSession(userId);
  return { message: 'Logged out' };
}

async function logoutByToken(token) {
  if (!token) {
    return { message: 'Logged out' };
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findSessionByUserId(payload.id);

    if (user && payload.sid && user.current_session_id === payload.sid) {
      await userRepository.clearCurrentSession(user.id);
    }
  } catch (_error) {
    // Ignore malformed or expired tokens for best-effort beacon logout.
  }

  return { message: 'Logged out' };
}

async function heartbeat(userId, sid) {
  if (!userId || !sid) {
    return { ok: false };
  }

  const affected = await userRepository.touchCurrentSession(userId, sid);
  return { ok: affected > 0 };
}

module.exports = { register, login, logout, logoutByToken, heartbeat };
