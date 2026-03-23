const { z } = require('zod');

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
    image_url: z.string().trim().url().optional().nullable().or(z.literal('')),
    answers: z.array(answerSchema).length(3),
  })
  .refine((value) => value.answers.filter((item) => item.is_correct).length === 1, {
    message: 'Each question must have exactly one correct answer',
    path: ['answers'],
  });

const createManualQuizSchema = z.object({
  subject_id: z.number().int().positive(),
  category_id: z.number().int().positive().optional().nullable(),
  quiz_type: z.string().trim().min(1).default('general'),
  title_vi: z.string().trim().min(1),
  title_es: z.string().trim().min(1),
  description_vi: z.string().trim().optional().nullable(),
  description_es: z.string().trim().optional().nullable(),
  instructions_vi: z.string().trim().optional().nullable(),
  instructions_es: z.string().trim().optional().nullable(),
  duration_minutes: z.number().int().nonnegative().default(0),
  passing_score: z.number().positive().default(5),
  questions: z.array(questionSchema).min(1),
});

module.exports = {
  createManualQuizSchema,
};
