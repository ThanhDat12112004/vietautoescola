const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
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

async function logoutBeacon(req, res, next) {
  try {
    const token = req.body?.token || '';
    const result = await authService.logoutByToken(token);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function heartbeat(req, res, next) {
  try {
    const result = await authService.heartbeat(req.user.id, req.user.sid);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, logout, logoutBeacon, heartbeat };
