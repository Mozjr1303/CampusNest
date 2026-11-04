import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusnest-secret-key-mwk-2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const stmt = db.prepare('SELECT user_id, full_name, email, phone, role, account_status FROM users WHERE user_id = ?');
    const user = stmt.get(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid.' });
    }

    if (user.account_status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const stmt = db.prepare('SELECT user_id, full_name, email, phone, role, account_status FROM users WHERE user_id = ?');
      const user = stmt.get(decoded.userId);
      if (user && user.account_status !== 'suspended') {
        req.user = user;
      }
    } catch {
      // Ignore invalid optional token
    }
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${roles.join(', ')}]`,
      });
    }

    next();
  };
}

export { JWT_SECRET };
