const express = require('express');
const materialsController = require('../../controllers/materials.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/subjects', materialsController.listSubjects);
router.get(
  '/admin/subjects',
  authRequired,
  requireRoles('admin'),
  materialsController.listSubjectsAdmin
);
router.post(
  '/admin/subjects',
  authRequired,
  requireRoles('admin'),
  materialsController.createSubject
);
router.patch(
  '/admin/subjects/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.updateSubject
);
router.delete(
  '/admin/subjects/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.deleteSubject
);
router.get('/subjects/:id/materials', materialsController.listReferenceMaterials);
router.post(
  '/subjects/:id/materials',
  authRequired,
  requireRoles('admin'),
  materialsController.createReferenceMaterial
);
router.post(
  '/subjects/:id/materials/bilingual',
  authRequired,
  requireRoles('admin'),
  materialsController.createReferenceMaterialsBilingual
);
router.patch(
  '/materials/:materialId',
  authRequired,
  requireRoles('admin'),
  materialsController.updateReferenceMaterial
);
router.delete(
  '/materials/:materialId',
  authRequired,
  requireRoles('admin'),
  materialsController.deleteReferenceMaterial
);

module.exports = router;
