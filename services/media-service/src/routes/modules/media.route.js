const express = require('express');
const multer = require('multer');
const mediaController = require('../../controllers/media.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/health', mediaController.health);
router.post(
  '/upload-image',
  authRequired,
  requireRoles('admin'),
  upload.single('image'),
  mediaController.uploadImage
);
router.post('/upload-avatar', authRequired, upload.single('image'), mediaController.uploadImage);
router.post(
  '/upload-material',
  authRequired,
  requireRoles('admin'),
  upload.single('file'),
  mediaController.uploadMaterial
);

module.exports = router;
