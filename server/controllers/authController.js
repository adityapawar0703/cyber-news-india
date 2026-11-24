import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function login(req, res, next) {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Please provide both username/email and password.' });
    }

    const admin = await Admin.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your login details.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your login details.' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signToken(admin);

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      displayName: req.admin.displayName,
      role: req.admin.role,
      lastLoginAt: req.admin.lastLoginAt,
    },
  });
}

export async function logout(_req, res) {
  res.json({ message: 'Signed out successfully.' });
}
