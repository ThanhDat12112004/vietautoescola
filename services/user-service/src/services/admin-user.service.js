const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');

async function listUsers() {
  return userRepository.findAllUsers();
}

async function createUser(payload) {
  const passwordHash = await bcrypt.hash(payload.password, 10);

  try {
    const id = await userRepository.createUserByAdmin({
      username: payload.username,
      email: payload.email,
      passwordHash,
      fullName: payload.full_name,
      role: payload.role || 'student',
      isActive: payload.is_active ?? true,
    });

    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Username or email already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function updateUser(userId, payload, actorId) {
  if (Number(userId) === Number(actorId) && payload.is_active === false) {
    const appError = new Error('Cannot lock your own account');
    appError.status = 400;
    throw appError;
  }

  const existing = await userRepository.findUserById(userId);
  if (!existing) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  let passwordHash = null;
  if (payload.password) {
    passwordHash = await bcrypt.hash(payload.password, 10);
  }

  try {
    await userRepository.updateUserByAdmin(userId, {
      username: payload.username ?? existing.username,
      email: payload.email ?? existing.email,
      fullName: payload.full_name ?? existing.full_name,
      role: payload.role ?? existing.role,
      isActive: payload.is_active ?? existing.is_active,
      passwordHash,
    });

    return { id: userId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Username or email already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function deleteUser(userId, actorId) {
  if (Number(userId) === Number(actorId)) {
    const appError = new Error('Cannot delete your own account');
    appError.status = 400;
    throw appError;
  }

  const affected = await userRepository.deleteUserById(userId);
  if (!affected) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  return { id: userId };
}

async function setUserLock(userId, locked, actorId) {
  if (Number(userId) === Number(actorId) && locked) {
    const appError = new Error('Cannot lock your own account');
    appError.status = 400;
    throw appError;
  }

  const affected = await userRepository.setUserLock(userId, locked);
  if (!affected) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  return { id: userId, is_active: !locked };
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserLock,
};
