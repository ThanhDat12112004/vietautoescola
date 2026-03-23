const quizService = require('../services/quiz.service');
const { getLang } = require('../utils/lang');
const { createManualQuizSchema } = require('../validators/quiz-admin.validator');
const { validateOrThrow } = require('../utils/validate');

async function listQuizzes(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const quizzes = await quizService.listQuizzes(lang);
    return res.json(quizzes);
  } catch (error) {
    return next(error);
  }
}

async function getQuizDetail(req, res, next) {
  const quizId = Number(req.params.id);
  if (Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz id' });
  }

  try {
    const lang = getLang(req.query.lang);
    const quiz = await quizService.getQuizDetail(quizId, lang);
    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

async function createManualQuiz(req, res, next) {
  try {
    const payload = validateOrThrow(createManualQuizSchema, req.body);
    const created = await quizService.createManualQuiz({
      ...payload,
      created_by: req.user.id,
    });
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

async function listAdminQuizzes(_req, res, next) {
  try {
    const rows = await quizService.listQuizzesForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function updateQuiz(req, res, next) {
  const quizId = Number(req.params.id);
  if (Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz id' });
  }

  const {
    subject_id,
    category_id,
    quiz_type,
    title_vi,
    title_es,
    description_vi,
    description_es,
    instructions_vi,
    instructions_es,
    passing_score,
    is_active,
  } = req.body;

  if (!quiz_type || !title_vi || !title_es || !passing_score) {
    return res.status(400).json({ message: 'quiz_type, title_vi, title_es, passing_score are required' });
  }

  try {
    const result = await quizService.updateQuiz(quizId, {
      subject_id,
      category_id,
      quiz_type,
      title_vi,
      title_es,
      description_vi,
      description_es,
      instructions_vi,
      instructions_es,
      passing_score,
      is_active,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteQuiz(req, res, next) {
  const quizId = Number(req.params.id);
  if (Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz id' });
  }

  try {
    const result = await quizService.deleteQuiz(quizId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listQuizzes,
  getQuizDetail,
  createManualQuiz,
  listAdminQuizzes,
  updateQuiz,
  deleteQuiz,
};
