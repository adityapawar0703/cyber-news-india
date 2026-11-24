import { Router } from 'express';
import {
  trackSiteVisit,
  trackArticleView,
  getAdminStats,
} from '../controllers/analyticsController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/visit', trackSiteVisit);
router.post('/article-view/:slug', trackArticleView);
router.get('/admin/stats', requireAdmin, getAdminStats);

export default router;
