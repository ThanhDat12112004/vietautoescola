const express = require('express');
const materialsController = require('../../controllers/materials.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');
const { cacheGet } = require('../../middleware/cache.middleware');

const router = express.Router();

router.get('/subjects', cacheGet(60_000), materialsController.listSubjects);
router.get('/subjects/material-counts', cacheGet(60_000), materialsController.listMaterialCountsBySubject);
router.get('/topic-groups', cacheGet(60_000), materialsController.listTopicGroups);
router.get(
  '/admin/topic-groups',
  authRequired,
  requireRoles('admin'),
  materialsController.listTopicGroupsAdmin
);
router.post(
  '/admin/topic-groups',
  authRequired,
  requireRoles('admin'),
  materialsController.createTopicGroup
);
router.patch(
  '/admin/topic-groups/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.updateTopicGroup
);
router.delete(
  '/admin/topic-groups/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.deleteTopicGroup
);
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
router.get('/subjects/:id/materials', cacheGet(60_000), materialsController.listReferenceMaterials);
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
