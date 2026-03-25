const quizRepository = require('../repositories/quiz.repository');

function normalizeMediaPath(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }
}

function normalizeQuestionMediaRefs(questions = []) {
  return questions.map((question) => ({
    ...question,
    image_url: normalizeMediaPath(question.image_url),
  }));
}

function normalizeQuizTypeId(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.trunc(numeric);
  }

  // Backward-compatible mapping for legacy string values.
  const legacyMap = {
    general: 1,
    bien_bao: 2,
    cao_toc: 3,
    ly_thuyet: 4,
    an_toan: 5,
    sa_hinh: 6,
  };
  return legacyMap[String(value || '').trim().toLowerCase()] || 1;
}

async function listQuizzes(lang, userId = null) {
  return quizRepository.findAllActiveQuizzes(lang, userId);
}

async function listCategories(lang) {
  return quizRepository.findAllActiveCategories(lang);
}

async function listCategoriesForAdmin() {
  return quizRepository.findAllCategoriesForAdmin();
}

async function listTypes(lang) {
  return quizRepository.findAllActiveTypes(lang);
}

async function listTypesForAdmin() {
  return quizRepository.findAllTypesForAdmin();
}

async function createType(payload) {
  try {
    const id = await quizRepository.createType(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Type already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function updateType(typeId, payload) {
  const existing = await quizRepository.findTypeById(typeId);
  if (!existing) {
    const appError = new Error('Type not found');
    appError.status = 404;
    throw appError;
  }

  try {
    const affected = await quizRepository.updateTypeById(typeId, payload);
    if (!affected) {
      const appError = new Error('Type not found');
      appError.status = 404;
      throw appError;
    }

    return { id: typeId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Type already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function deleteType(typeId) {
  const existing = await quizRepository.findTypeById(typeId);
  if (!existing) {
    const appError = new Error('Type not found');
    appError.status = 404;
    throw appError;
  }

  const usedCount = await quizRepository.countQuizzesByTypeId(existing.id);
  if (usedCount > 0) {
    const appError = new Error('Cannot delete type because it is being used');
    appError.status = 409;
    throw appError;
  }

  const affected = await quizRepository.deleteTypeById(typeId);
  if (!affected) {
    const appError = new Error('Type not found');
    appError.status = 404;
    throw appError;
  }

  return { id: typeId };
}

async function createCategory(payload) {
  try {
    const id = await quizRepository.createCategory(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Category slug already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function updateCategory(categoryId, payload) {
  try {
    const affected = await quizRepository.updateCategoryById(categoryId, payload);
    if (!affected) {
      const appError = new Error('Category not found');
      appError.status = 404;
      throw appError;
    }

    return { id: categoryId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Category slug already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function deleteCategory(categoryId) {
  try {
    const affected = await quizRepository.deleteCategoryById(categoryId);
    if (!affected) {
      const appError = new Error('Category not found');
      appError.status = 404;
      throw appError;
    }

    return { id: categoryId };
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      const appError = new Error('Cannot delete category because it is being used');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function getQuizDetail(quizId, lang) {
  const quiz = await quizRepository.findQuizById(quizId, lang);

  if (!quiz) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  const questions = await quizRepository.findQuestionsByQuizId(quizId, lang);
  const questionIds = questions.map((item) => item.id);
  const answers = await quizRepository.findAnswersByQuestionIds(questionIds, lang);

  const answersByQuestion = answers.reduce((acc, item) => {
    if (!acc[item.question_id]) {
      acc[item.question_id] = [];
    }

    acc[item.question_id].push({
      id: item.id,
      order_number: item.order_number,
      answer_text: item.answer_text,
    });

    return acc;
  }, {});

  quiz.questions = questions.map((question) => ({
    id: question.id,
    order_number: question.order_number,
    points: Number(question.points),
    image_url: question.image_url,
    question_text: question.question_text,
    explanation: question.explanation,
    answers: answersByQuestion[question.id] || [],
  }));

  return quiz;
}

async function createManualQuiz(payload) {
  try {
    return await quizRepository.createManualQuiz({
      ...payload,
      quiz_type_id: normalizeQuizTypeId(payload.quiz_type_id ?? payload.quiz_type),
      questions: normalizeQuestionMediaRefs(payload.questions || []),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Quiz already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function listQuizzesForAdmin() {
  return quizRepository.findAllQuizzesForAdmin();
}

async function updateQuiz(quizId, payload) {
  const normalizedPayload = {
    ...payload,
    quiz_type_id: normalizeQuizTypeId(payload.quiz_type_id ?? payload.quiz_type),
  };

  const affected = await quizRepository.updateQuizById(quizId, normalizedPayload);
  if (!affected) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return { id: quizId };
}

async function getQuizDetailForAdmin(quizId) {
  const detail = await quizRepository.findQuizDetailForAdmin(quizId);
  if (!detail) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return detail;
}

async function updateQuizDetail(quizId, payload) {
  const normalizedPayload = {
    ...payload,
    quiz_type_id: normalizeQuizTypeId(payload.quiz_type_id ?? payload.quiz_type),
    questions: normalizeQuestionMediaRefs(payload.questions || []),
  };

  const affected = await quizRepository.updateQuizDetailById(quizId, normalizedPayload);
  if (!affected) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return { id: quizId };
}

async function deleteQuiz(quizId) {
  const affected = await quizRepository.deleteQuizById(quizId);
  if (!affected) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return { id: quizId };
}

module.exports = {
  listQuizzes,
  listCategories,
  listCategoriesForAdmin,
  listTypes,
  listTypesForAdmin,
  createType,
  updateType,
  deleteType,
  createCategory,
  updateCategory,
  deleteCategory,
  getQuizDetail,
  createManualQuiz,
  listQuizzesForAdmin,
  getQuizDetailForAdmin,
  updateQuizDetail,
  updateQuiz,
  deleteQuiz,
};
