const authService = require('../services/auth.service');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validators/auth.validator');
const { validateOrThrow } = require('../utils/validate');

async function register(req, res, next) {
  try {
    const payload = validateOrThrow(registerSchema, req.body);
    const result = await authService.register(payload);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = validateOrThrow(loginSchema, req.body);
    const result = await authService.login(payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

/** Lightweight check: auth middleware validates JWT + current_session_id; use for client polling. */
function sessionPing(_req, res) {
  return res.json({ ok: true });
}

async function updateMyAvatar(req, res, next) {
  try {
    const avatarUrl = String(req.body?.avatar_url || '').trim();
    if (!avatarUrl) {
      return res.status(400).json({ message: 'avatar_url is required' });
    }

    const result = await authService.updateMyAvatar(req.user.id, avatarUrl);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const payload = validateOrThrow(updateProfileSchema, req.body || {});
    const result = await authService.updateMyProfile(req.user.id, payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  sessionPing,
  updateMyAvatar,
  updateMyProfile,
};
