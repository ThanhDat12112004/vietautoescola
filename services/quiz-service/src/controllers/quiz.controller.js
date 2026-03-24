const quizService = require('../services/quiz.service');
const { getLang } = require('../utils/lang');
const {
  createManualQuizSchema,
  updateQuizDetailSchema,
} = require('../validators/quiz-admin.validator');
const { validateOrThrow } = require('../utils/validate');

async function listQuizzes(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const quizzes = await quizService.listQuizzes(lang, req.user?.id || null);
    return res.json(quizzes);
  } catch (error) {
    return next(error);
  }
}

async function listCategories(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await quizService.listCategories(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listTypes(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await quizService.listTypes(lang);
    return res.json(rows);
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

async function listAdminCategories(_req, res, next) {
  try {
    const rows = await quizService.listCategoriesForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listAdminTypes(_req, res, next) {
  try {
    const rows = await quizService.listTypesForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createType(req, res, next) {
  const { code, name_vi, name_es, description_vi, description_es, is_active } = req.body;

  if (!name_vi || !name_es) {
    return res.status(400).json({ message: 'name_vi and name_es are required' });
  }

  try {
    const result = await quizService.createType({
      code,
      name_vi,
      name_es,
      description_vi,
      description_es,
      is_active,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateType(req, res, next) {
  const typeId = Number(req.params.id);
  if (Number.isNaN(typeId)) {
    return res.status(400).json({ message: 'Invalid type id' });
  }

  const { code, name_vi, name_es, description_vi, description_es, is_active } = req.body;
  if (!name_vi || !name_es) {
    return res.status(400).json({ message: 'name_vi and name_es are required' });
  }

  try {
    const result = await quizService.updateType(typeId, {
      code,
      name_vi,
      name_es,
      description_vi,
      description_es,
      is_active,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteType(req, res, next) {
  const typeId = Number(req.params.id);
  if (Number.isNaN(typeId)) {
    return res.status(400).json({ message: 'Invalid type id' });
  }

  try {
    const result = await quizService.deleteType(typeId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  const { name_vi, name_es, slug, description_vi, description_es, is_active } = req.body;

  if (!name_vi || !name_es) {
    return res.status(400).json({ message: 'name_vi and name_es are required' });
  }

  try {
    const result = await quizService.createCategory({
      name_vi,
      name_es,
      slug,
      description_vi,
      description_es,
      is_active,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateCategory(req, res, next) {
  const categoryId = Number(req.params.id);
  if (Number.isNaN(categoryId)) {
    return res.status(400).json({ message: 'Invalid category id' });
  }

  const { name_vi, name_es, slug, description_vi, description_es, is_active } = req.body;

  if (!name_vi || !name_es) {
    return res.status(400).json({ message: 'name_vi and name_es are required' });
  }

  try {
    const result = await quizService.updateCategory(categoryId, {
      name_vi,
      name_es,
      slug,
      description_vi,
      description_es,
      is_active,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(req, res, next) {
  const categoryId = Number(req.params.id);
  if (Number.isNaN(categoryId)) {
    return res.status(400).json({ message: 'Invalid category id' });
  }

  try {
    const result = await quizService.deleteCategory(categoryId);
    return res.json(result);
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
    return res
      .status(400)
      .json({ message: 'quiz_type, title_vi, title_es, passing_score are required' });
  }

  try {
    const result = await quizService.updateQuiz(quizId, {
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

async function getAdminQuizDetail(req, res, next) {
  const quizId = Number(req.params.id);
  if (Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz id' });
  }

  try {
    const detail = await quizService.getQuizDetailForAdmin(quizId);
    return res.json(detail);
  } catch (error) {
    return next(error);
  }
}

async function updateQuizDetail(req, res, next) {
  const quizId = Number(req.params.id);
  if (Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz id' });
  }

  try {
    const payload = validateOrThrow(updateQuizDetailSchema, req.body);
    const result = await quizService.updateQuizDetail(quizId, payload);
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
  listCategories,
  listTypes,
  getQuizDetail,
  createManualQuiz,
  listAdminQuizzes,
  listAdminCategories,
  listAdminTypes,
  createType,
  updateType,
  deleteType,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminQuizDetail,
  updateQuizDetail,
  updateQuiz,
  deleteQuiz,
};
