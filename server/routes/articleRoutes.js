import { Router } from 'express';
import {
  getHomeFeed,
  getPublicArticles,
  getArticleBySlug,
  getCategories,
  getAdminArticles,
  getAdminArticleById,
  createArticle,
  updateArticle,
  toggleArticleStatus,
  deleteArticle,
} from '../controllers/articleController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/home-feed', getHomeFeed);
router.get('/categories', getCategories);
router.get('/', getPublicArticles);

// Admin protected routes (must come before /:slug!)
router.get('/admin/list', requireAdmin, getAdminArticles);
router.get('/admin/:id', requireAdmin, getAdminArticleById);
router.post('/', requireAdmin, createArticle);
router.put('/:id', requireAdmin, updateArticle);
router.patch('/:id/status', requireAdmin, toggleArticleStatus);
router.delete('/:id', requireAdmin, deleteArticle);

// Public single article by slug
router.get('/:slug', getArticleBySlug);

export default router;
