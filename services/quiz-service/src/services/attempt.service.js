const attemptRepository = require('../repositories/attempt.repository');

async function calculateAttemptResult(quizId, submittedAnswers) {
  const questions = await attemptRepository.findQuestionsByQuizId(quizId);

  if (!questions.length) {
    return {
      totalQuestions: 0,
      totalPoints: 0,
      score: 0,
      correctCount: 0,
      details: [],
    };
  }

  const questionIds = questions.map((q) => q.id);
  const answers = await attemptRepository.findAnswersByQuestionIds(questionIds);

  const correctAnswerByQuestion = new Map();
  for (const ans of answers) {
    if (ans.is_correct) {
      correctAnswerByQuestion.set(ans.question_id, ans.id);
    }
  }

  let score = 0;
  let correctCount = 0;
  let totalPoints = 0;

  const details = questions.map((question) => {
    totalPoints += Number(question.points);

    const selectedAnswerId = submittedAnswers[String(question.id)] || null;
    const correctAnswerId = correctAnswerByQuestion.get(question.id) || null;
    const isCorrect =
      selectedAnswerId && correctAnswerId
        ? Number(selectedAnswerId) === Number(correctAnswerId)
        : false;

    const pointsEarned = isCorrect ? Number(question.points) : 0;
    if (isCorrect) {
      score += pointsEarned;
      correctCount += 1;
    }

    return {
      questionId: question.id,
      selectedAnswerId: selectedAnswerId ? Number(selectedAnswerId) : null,
      correctAnswerId,
      isCorrect,
      pointsEarned,
    };
  });

  return {
    totalQuestions: questions.length,
    totalPoints,
    score,
    correctCount,
    details,
  };
}

async function startAttempt(userId, quizId) {
  const quiz = await attemptRepository.findActiveQuizById(quizId);
  if (!quiz) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  const attemptId = await attemptRepository.createAttempt(userId, quizId);
  return { attempt_id: attemptId };
}

async function checkQuestion(userId, attemptId, payload) {
  const attempt = await attemptRepository.findAttemptByIdAndUser(attemptId, userId);

  if (!attempt) {
    const appError = new Error('Attempt not found');
    appError.status = 404;
    throw appError;
  }

  if (attempt.status === 'completed') {
    const appError = new Error('Attempt already submitted');
    appError.status = 400;
    throw appError;
  }

  const question = await attemptRepository.findQuestionByIdAndQuizId(payload.question_id, attempt.quiz_id);
  if (!question) {
    const appError = new Error('Question does not belong to this attempt');
    appError.status = 400;
    throw appError;
  }

  const selectedAnswer = await attemptRepository.findAnswerByIdAndQuestionId(
    payload.answer_id,
    payload.question_id
  );
  if (!selectedAnswer) {
    const appError = new Error('Answer does not belong to this question');
    appError.status = 400;
    throw appError;
  }

  const correctAnswer = await attemptRepository.findCorrectAnswerForQuestion(payload.question_id);
  const correctAnswerId = correctAnswer ? Number(correctAnswer.id) : null;
  const selectedAnswerId = Number(payload.answer_id);
  const isCorrect = correctAnswerId ? correctAnswerId === selectedAnswerId : false;

  return {
    attempt_id: attemptId,
    question_id: Number(payload.question_id),
    selected_answer_id: selectedAnswerId,
    correct_answer_id: correctAnswerId,
    is_correct: isCorrect,
    points_earned: isCorrect ? Number(question.points) : 0,
  };
}

async function submitAttempt(userId, attemptId, answers) {
  const connection = await attemptRepository.getConnection();

  try {
    await connection.beginTransaction();

    const attempt = await attemptRepository.findAttemptForSubmit(connection, attemptId, userId);

    if (!attempt) {
      const appError = new Error('Attempt not found');
      appError.status = 404;
      throw appError;
    }

    if (attempt.status === 'completed') {
      const appError = new Error('Attempt already submitted');
      appError.status = 400;
      throw appError;
    }

    const result = await calculateAttemptResult(attempt.quiz_id, answers);
    const percentage = result.totalQuestions
      ? Number(((result.correctCount / result.totalQuestions) * 100).toFixed(2))
      : 0;

    await attemptRepository.markAttemptCompleted(connection, {
      attemptId,
      score: result.score,
      percentage,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
    });

    for (const item of result.details) {
      await attemptRepository.upsertUserAnswer(connection, {
        attemptId,
        questionId: item.questionId,
        selectedAnswerId: item.selectedAnswerId,
        isCorrect: item.isCorrect,
        pointsEarned: item.pointsEarned,
      });
    }

    await attemptRepository.refreshUserStats(connection, userId);
    await connection.commit();

    return {
      attempt_id: attemptId,
      score: result.score,
      total_points: result.totalPoints,
      correct_count: result.correctCount,
      total_questions: result.totalQuestions,
      percentage,
      details: result.details.map((item) => ({
        question_id: item.questionId,
        selected_answer_id: item.selectedAnswerId,
        correct_answer_id: item.correctAnswerId,
        is_correct: item.isCorrect,
        points_earned: item.pointsEarned,
      })),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { calculateAttemptResult, startAttempt, checkQuestion, submitAttempt };
