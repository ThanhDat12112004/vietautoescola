const express = require('express');
const quizController = require('../../controllers/quiz.controller');
const { authRequired, authOptional, requireRoles } = require('../../middleware/auth.middleware');
const { cacheGet } = require('../../middleware/cache.middleware');

const router = express.Router();

router.get(
  '/quizzes',
  cacheGet(60_000, { bypass: (req) => Boolean(req.headers.authorization) }),
  authOptional,
  quizController.listQuizzes
);
router.get('/topic-groups', cacheGet(60_000), quizController.listTopicGroups);
router.get('/categories', cacheGet(60_000), quizController.listCategories);
router.get('/types', cacheGet(60_000), quizController.listTypes);
router.get('/quizzes/:id', cacheGet(60_000), quizController.getQuizDetail);
router.post('/quizzes', authRequired, requireRoles('admin'), quizController.createManualQuiz);
router.get(
  '/admin/topic-groups',
  authRequired,
  requireRoles('admin'),
  quizController.listAdminTopicGroups
);
router.post(
  '/admin/topic-groups',
  authRequired,
  requireRoles('admin'),
  quizController.createTopicGroup
);
router.patch(
  '/admin/topic-groups/:id',
  authRequired,
  requireRoles('admin'),
  quizController.updateTopicGroup
);
router.delete(
  '/admin/topic-groups/:id',
  authRequired,
  requireRoles('admin'),
  quizController.deleteTopicGroup
);
router.get(
  '/admin/categories',
  authRequired,
  requireRoles('admin'),
  quizController.listAdminCategories
);
router.get('/admin/types', authRequired, requireRoles('admin'), quizController.listAdminTypes);
router.post('/admin/types', authRequired, requireRoles('admin'), quizController.createType);
router.patch('/admin/types/:id', authRequired, requireRoles('admin'), quizController.updateType);
router.delete('/admin/types/:id', authRequired, requireRoles('admin'), quizController.deleteType);
router.post(
  '/admin/categories',
  authRequired,
  requireRoles('admin'),
  quizController.createCategory
);
router.patch(
  '/admin/categories/:id',
  authRequired,
  requireRoles('admin'),
  quizController.updateCategory
);
router.delete(
  '/admin/categories/:id',
  authRequired,
  requireRoles('admin'),
  quizController.deleteCategory
);
router.get('/admin/quizzes', authRequired, requireRoles('admin'), quizController.listAdminQuizzes);
router.get(
  '/admin/quizzes/:id/detail',
  authRequired,
  requireRoles('admin'),
  quizController.getAdminQuizDetail
);
router.patch('/admin/quizzes/:id', authRequired, requireRoles('admin'), quizController.updateQuiz);
router.patch(
  '/admin/quizzes/:id/detail',
  authRequired,
  requireRoles('admin'),
  quizController.updateQuizDetail
);
router.delete('/admin/quizzes/:id', authRequired, requireRoles('admin'), quizController.deleteQuiz);

module.exports = router;
