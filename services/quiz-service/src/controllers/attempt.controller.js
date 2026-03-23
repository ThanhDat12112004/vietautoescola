const attemptService = require('../services/attempt.service');
const {
  startAttemptSchema,
  submitAttemptSchema,
  checkQuestionSchema,
} = require('../validators/attempt.validator');
const { validateOrThrow } = require('../utils/validate');

async function startAttempt(req, res, next) {
  try {
    const payload = validateOrThrow(startAttemptSchema, req.body);
    const result = await attemptService.startAttempt(req.user.id, payload.quiz_id);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function submitAttempt(req, res, next) {
  const attemptId = Number(req.params.id);
  if (Number.isNaN(attemptId)) {
    return res.status(400).json({ message: 'Invalid attempt id' });
  }

  try {
    const payload = validateOrThrow(submitAttemptSchema, req.body);
    const result = await attemptService.submitAttempt(req.user.id, attemptId, payload.answers);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function checkQuestion(req, res, next) {
  const attemptId = Number(req.params.id);
  if (Number.isNaN(attemptId)) {
    return res.status(400).json({ message: 'Invalid attempt id' });
  }

  try {
    const payload = validateOrThrow(checkQuestionSchema, req.body);
    const result = await attemptService.checkQuestion(req.user.id, attemptId, payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { startAttempt, submitAttempt, checkQuestion };
