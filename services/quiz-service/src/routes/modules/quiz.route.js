const express = require('express');
const quizController = require('../../controllers/quiz.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/quizzes', quizController.listQuizzes);
router.get('/categories', quizController.listCategories);
router.get('/types', quizController.listTypes);
router.get('/quizzes/:id', quizController.getQuizDetail);
router.post('/quizzes', authRequired, requireRoles('admin'), quizController.createManualQuiz);
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
router.patch('/admin/quizzes/:id', authRequired, requireRoles('admin'), quizController.updateQuiz);
router.delete('/admin/quizzes/:id', authRequired, requireRoles('admin'), quizController.deleteQuiz);

module.exports = router;
