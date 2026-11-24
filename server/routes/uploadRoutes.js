import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { handleImageUpload } from '../controllers/uploadController.js';

const router = Router();

router.post('/image', requireAdmin, uploadImage.single('image'), handleImageUpload);

export default router;
