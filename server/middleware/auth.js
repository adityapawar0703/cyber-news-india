import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const secret = process.env.JWT_SECRET || 'cin_fallback_jwt_secret_please_set_in_env_2026';

    const decoded = jwt.verify(token, secret);
    const admin = await Admin.findById(decoded.id).select('-password').lean();
    if (!admin) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
