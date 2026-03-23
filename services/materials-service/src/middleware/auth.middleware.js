const jwt = require('jsonwebtoken');
const materialsRepository = require('../repositories/materials.repository');

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment');
}

async function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await materialsRepository.findUserSessionById(payload.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Account is not available' });
    }

    if (!payload.sid || user.current_session_id !== payload.sid) {
      return res.status(401).json({ message: 'Session expired on this device' });
    }

    req.user = { ...payload, role: user.role };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = { authRequired, requireRoles };
