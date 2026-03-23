const jwt = require('jsonwebtoken');
const statsRepository = require('../repositories/stats.repository');

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
    const user = await statsRepository.findUserSessionById(payload.id);

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

module.exports = { authRequired };
