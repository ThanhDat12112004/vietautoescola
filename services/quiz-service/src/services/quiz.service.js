const quizRepository = require('../repositories/quiz.repository');

async function listQuizzes(lang) {
  return quizRepository.findAllActiveQuizzes(lang);
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
    return await quizRepository.createManualQuiz(payload);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Quiz code already exists');
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
  const affected = await quizRepository.updateQuizById(quizId, payload);
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
  getQuizDetail,
  createManualQuiz,
  listQuizzesForAdmin,
  updateQuiz,
  deleteQuiz,
};
