const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const userRepository = require('../repositories/user.repository');

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

  const sid = randomUUID().replace(/-/g, '');
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role, sid },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  await userRepository.updateLoginSession(user.id, sid);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name || null,
      role: user.role,
      avatar_url: user.avatar_url || null,
    },
  };
}

async function logout(userId) {
  await userRepository.clearCurrentSession(userId);
  return { message: 'Logged out' };
}

function normalizeMediaPath(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }
}

async function updateMyAvatar(userId, avatarUrl) {
  const normalizedAvatarPath = normalizeMediaPath(avatarUrl);
  if (!normalizedAvatarPath) {
    const appError = new Error('avatar_url is required');
    appError.status = 400;
    throw appError;
  }

  const updated = await userRepository.updateAvatarUrl(userId, normalizedAvatarPath);
  if (!updated) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  return {
    message: 'Avatar updated',
    user: {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      full_name: updated.full_name || null,
      role: updated.role,
      avatar_url: updated.avatar_url || null,
    },
  };
}

async function updateMyProfile(userId, payload) {
  const existing = await userRepository.findUserWithPasswordById(userId);
  if (!existing) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  let passwordHash = null;
  if (payload.new_password) {
    const valid = await bcrypt.compare(payload.current_password || '', existing.password_hash);
    if (!valid) {
      const appError = new Error('Current password is incorrect');
      appError.status = 400;
      throw appError;
    }

    passwordHash = await bcrypt.hash(payload.new_password, 10);
  }

  await userRepository.updateProfileByUser(userId, {
    fullName: payload.full_name ?? existing.full_name,
    passwordHash,
  });

  const updated = await userRepository.findUserById(userId);
  return {
    message: 'Profile updated',
    user: {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      full_name: updated.full_name || null,
      role: updated.role,
      avatar_url: updated.avatar_url || null,
    },
  };
}

module.exports = {
  register,
  login,
  logout,
  updateMyAvatar,
  updateMyProfile,
};
