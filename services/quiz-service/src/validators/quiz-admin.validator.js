const { z } = require('zod');

function isValidMediaRef(value) {
  if (!value) return true;

  const raw = String(value).trim();
  if (!raw) return true;

  if (/^https?:\/\//i.test(raw)) {
    try {
      // Validate URL format for absolute references.
      new URL(raw);
      return true;
    } catch {
      return false;
    }
  }

  // Accept relative/absolute paths such as /media/static/... or media/static/...
  return /^\/?[A-Za-z0-9._\-/]+(?:\?[^\s#]*)?(?:#[^\s]*)?$/.test(raw);
}

const mediaRefSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .or(z.literal(''))
  .refine((value) => isValidMediaRef(value), {
    message: 'Invalid image_url format',
  });

const answerSchema = z.object({
  answer_text_vi: z.string().trim().min(1),
  answer_text_es: z.string().trim().min(1),
  is_correct: z.boolean(),
});

const questionSchema = z
  .object({
    question_text_vi: z.string().trim().min(1),
    question_text_es: z.string().trim().min(1),
    explanation_vi: z.string().trim().optional().nullable(),
    explanation_es: z.string().trim().optional().nullable(),
    image_url: mediaRefSchema,
    answers: z.array(answerSchema).length(3),
  })
  .refine((value) => value.answers.filter((item) => item.is_correct).length === 1, {
    message: 'Each question must have exactly one correct answer',
    path: ['answers'],
  });

const createManualQuizSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  quiz_type: z.string().trim().min(1).default('general'),
  title_vi: z.string().trim().min(1),
  title_es: z.string().trim().min(1),
  description_vi: z.string().trim().optional().nullable(),
  description_es: z.string().trim().optional().nullable(),
  instructions_vi: z.string().trim().optional().nullable(),
  instructions_es: z.string().trim().optional().nullable(),
  duration_minutes: z.number().int().nonnegative().default(0),
  passing_score: z.number().positive().default(10),
  questions: z.array(questionSchema).min(1),
});

const detailAnswerSchema = z.object({
  id: z.number().int().positive().optional(),
  answer_text_vi: z.string().trim().min(1),
  answer_text_es: z.string().trim().min(1),
  is_correct: z.boolean(),
});

const detailQuestionSchema = z
  .object({
    id: z.number().int().positive().optional(),
    question_text_vi: z.string().trim().min(1),
    question_text_es: z.string().trim().min(1),
    explanation_vi: z.string().trim().optional().nullable(),
    explanation_es: z.string().trim().optional().nullable(),
    image_url: mediaRefSchema,
    answers: z.array(detailAnswerSchema).length(3),
  })
  .refine((value) => value.answers.filter((item) => item.is_correct).length === 1, {
    message: 'Each question must have exactly one correct answer',
    path: ['answers'],
  });

const updateQuizDetailSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  quiz_type: z.union([z.string().trim().min(1), z.number().int().positive()]),
  title_vi: z.string().trim().min(1),
  title_es: z.string().trim().min(1),
  description_vi: z.string().trim().optional().nullable(),
  description_es: z.string().trim().optional().nullable(),
  instructions_vi: z.string().trim().optional().nullable(),
  instructions_es: z.string().trim().optional().nullable(),
  passing_score: z.number().positive().default(10),
  is_active: z.boolean().optional().default(true),
  questions: z.array(detailQuestionSchema).min(1),
});

module.exports = {
  createManualQuizSchema,
  updateQuizDetailSchema,
};
