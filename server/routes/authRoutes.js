import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, logout } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

router.post('/login', loginLimiter, login);
router.get('/me', requireAdmin, getMe);
router.post('/logout', requireAdmin, logout);

export default router;
