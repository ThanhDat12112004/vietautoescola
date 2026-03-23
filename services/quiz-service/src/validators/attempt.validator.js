const { z } = require('zod');

const startAttemptSchema = z.object({
  quiz_id: z.number().int().positive(),
});

const submitAttemptSchema = z.object({
  answers: z.record(z.string(), z.number().int().positive()),
});

const checkQuestionSchema = z.object({
  question_id: z.number().int().positive(),
  answer_id: z.number().int().positive(),
});

module.exports = { startAttemptSchema, submitAttemptSchema, checkQuestionSchema };
