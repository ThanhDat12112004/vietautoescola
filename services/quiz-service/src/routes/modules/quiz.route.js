const express = require('express');
const quizController = require('../../controllers/quiz.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/quizzes', quizController.listQuizzes);
router.get('/quizzes/:id', quizController.getQuizDetail);
router.post('/quizzes', authRequired, requireRoles('admin'), quizController.createManualQuiz);
router.get('/admin/quizzes', authRequired, requireRoles('admin'), quizController.listAdminQuizzes);
router.patch('/admin/quizzes/:id', authRequired, requireRoles('admin'), quizController.updateQuiz);
router.delete('/admin/quizzes/:id', authRequired, requireRoles('admin'), quizController.deleteQuiz);

module.exports = router;
