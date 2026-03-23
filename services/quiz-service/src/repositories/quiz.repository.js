const pool = require('../config/db');

function formatQuizCode(sequence) {
  return `QUIZ-${String(sequence).padStart(6, '0')}`;
}

async function findAllActiveCategories(lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       slug,
       ${lang === 'es' ? 'name_es' : 'name_vi'} AS name,
       ${lang === 'es' ? 'description_es' : 'description_vi'} AS description
     FROM quiz_categories
     WHERE is_active = TRUE
     ORDER BY id DESC`
  );

  return rows;
}

async function findAllCategoriesForAdmin() {
  const [rows] = await pool.query(
    `SELECT
       id,
       name_vi,
       name_es,
       slug,
       description_vi,
       description_es,
       is_active,
       created_at,
       updated_at
     FROM quiz_categories
     ORDER BY created_at DESC`
  );

  return rows;
}

async function createCategory(payload) {
  const [result] = await pool.execute(
    `INSERT INTO quiz_categories
      (name_vi, name_es, slug, description_vi, description_es, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.name_vi,
      payload.name_es,
      payload.slug || null,
      payload.description_vi || null,
      payload.description_es || null,
      payload.is_active == null ? true : Boolean(payload.is_active),
    ]
  );

  return result.insertId;
}

async function updateCategoryById(categoryId, payload) {
  const [result] = await pool.execute(
    `UPDATE quiz_categories
     SET name_vi = ?,
         name_es = ?,
         slug = ?,
         description_vi = ?,
         description_es = ?,
         is_active = ?
     WHERE id = ?`,
    [
      payload.name_vi,
      payload.name_es,
      payload.slug || null,
      payload.description_vi || null,
      payload.description_es || null,
      payload.is_active == null ? true : Boolean(payload.is_active),
      categoryId,
    ]
  );

  return result.affectedRows;
}

async function deleteCategoryById(categoryId) {
  const [result] = await pool.execute('DELETE FROM quiz_categories WHERE id = ?', [categoryId]);
  return result.affectedRows;
}

async function findAllActiveTypes(lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       ${lang === 'es' ? 'name_es' : 'name_vi'} AS name,
       ${lang === 'es' ? 'description_es' : 'description_vi'} AS description
     FROM quiz_types
     WHERE is_active = TRUE
     ORDER BY created_at DESC, id DESC`
  );

  return rows;
}

async function findAllTypesForAdmin() {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       name_vi,
       name_es,
       description_vi,
       description_es,
       is_active,
       created_at,
       updated_at
     FROM quiz_types
     ORDER BY created_at DESC, id DESC`
  );

  return rows;
}

async function findTypeById(typeId) {
  const [rows] = await pool.execute(
    `SELECT id, code, is_active
     FROM quiz_types
     WHERE id = ?
     LIMIT 1`,
    [typeId]
  );

  return rows[0] || null;
}

async function createType(payload) {
  const [result] = await pool.execute(
    `INSERT INTO quiz_types
      (code, name_vi, name_es, description_vi, description_es, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.code,
      payload.name_vi,
      payload.name_es,
      payload.description_vi || null,
      payload.description_es || null,
      payload.is_active == null ? true : Boolean(payload.is_active),
    ]
  );

  return result.insertId;
}

async function updateTypeById(typeId, payload) {
  const [result] = await pool.execute(
    `UPDATE quiz_types
     SET code = ?,
         name_vi = ?,
         name_es = ?,
         description_vi = ?,
         description_es = ?,
         is_active = ?
     WHERE id = ?`,
    [
      payload.code,
      payload.name_vi,
      payload.name_es,
      payload.description_vi || null,
      payload.description_es || null,
      payload.is_active == null ? true : Boolean(payload.is_active),
      typeId,
    ]
  );

  return result.affectedRows;
}

async function deleteTypeById(typeId) {
  const [result] = await pool.execute('DELETE FROM quiz_types WHERE id = ?', [typeId]);
  return result.affectedRows;
}

async function countQuizzesByTypeCode(typeCode) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM quizzes
     WHERE quiz_type = ?`,
    [typeCode]
  );

  return Number(rows[0]?.total || 0);
}

async function findAllActiveQuizzes(lang) {
  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.code,
       q.quiz_type,
       q.duration_minutes,
       q.total_questions,
       q.passing_score,
       q.created_at,
       q.${lang === 'es' ? 'title_es' : 'title_vi'} AS title,
       q.${lang === 'es' ? 'description_es' : 'description_vi'} AS description,
       c.${lang === 'es' ? 'name_es' : 'name_vi'} AS category_name
     FROM quizzes q
     LEFT JOIN quiz_categories c ON c.id = q.category_id
     WHERE q.is_active = TRUE
     ORDER BY q.created_at DESC`
  );

  return rows;
}

async function findQuizById(quizId, lang) {
  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.code,
       q.duration_minutes,
       q.total_questions,
       q.passing_score,
       q.${lang === 'es' ? 'title_es' : 'title_vi'} AS title,
       q.${lang === 'es' ? 'description_es' : 'description_vi'} AS description,
       q.${lang === 'es' ? 'instructions_es' : 'instructions_vi'} AS instructions
     FROM quizzes q
     WHERE q.id = ? AND q.is_active = TRUE
     LIMIT 1`,
    [quizId]
  );

  return rows[0] || null;
}

async function findQuestionsByQuizId(quizId, lang) {
  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.order_number,
       q.points,
       q.image_url,
       q.${lang === 'es' ? 'question_text_es' : 'question_text_vi'} AS question_text,
       q.${lang === 'es' ? 'explanation_es' : 'explanation_vi'} AS explanation
     FROM questions q
     WHERE q.quiz_id = ?
     ORDER BY q.order_number ASC`,
    [quizId]
  );

  return rows;
}

async function findAnswersByQuestionIds(questionIds, lang) {
  if (!questionIds.length) {
    return [];
  }

  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.question_id,
       a.order_number,
       a.${lang === 'es' ? 'answer_text_es' : 'answer_text_vi'} AS answer_text
     FROM answers a
     WHERE a.question_id IN (?)
     ORDER BY a.question_id ASC, a.order_number ASC`,
    [questionIds]
  );

  return rows;
}

async function createManualQuiz(payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [lastRows] = await connection.query('SELECT IFNULL(MAX(id), 0) AS max_id FROM quizzes');
    const nextSequence = Number(lastRows[0].max_id) + 1;
    const generatedCode = formatQuizCode(nextSequence);

    const [quizResult] = await connection.execute(
      `INSERT INTO quizzes
        (
          category_id,
          code,
          quiz_type,
          title_vi,
          title_es,
          description_vi,
          description_es,
          instructions_vi,
          instructions_es,
          duration_minutes,
          total_questions,
          passing_score,
          is_active,
          created_by
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        payload.category_id || null,
        generatedCode,
        payload.quiz_type || 'general',
        payload.title_vi,
        payload.title_es,
        payload.description_vi || null,
        payload.description_es || null,
        payload.instructions_vi || null,
        payload.instructions_es || null,
        payload.duration_minutes ?? 0,
        payload.questions.length,
        payload.passing_score ?? 10,
        payload.created_by,
      ]
    );

    const quizId = quizResult.insertId;
    const pointsPerQuestion = Number((10 / payload.questions.length).toFixed(2));

    for (let index = 0; index < payload.questions.length; index += 1) {
      const question = payload.questions[index];
      const [questionResult] = await connection.execute(
        `INSERT INTO questions
          (
            quiz_id,
            order_number,
            points,
            question_text_vi,
            question_text_es,
            explanation_vi,
            explanation_es,
            image_url
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          index + 1,
          pointsPerQuestion,
          question.question_text_vi,
          question.question_text_es,
          question.explanation_vi || null,
          question.explanation_es || null,
          question.image_url || null,
        ]
      );

      const questionId = questionResult.insertId;

      for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex += 1) {
        const answer = question.answers[answerIndex];
        await connection.execute(
          `INSERT INTO answers
            (
              question_id,
              order_number,
              is_correct,
              answer_text_vi,
              answer_text_es
            )
           VALUES (?, ?, ?, ?, ?)`,
          [
            questionId,
            answerIndex + 1,
            answer.is_correct,
            answer.answer_text_vi,
            answer.answer_text_es,
          ]
        );
      }
    }

    await connection.commit();
    return { id: quizId, code: generatedCode };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findAllQuizzesForAdmin() {
  const [rows] = await pool.query(
    `SELECT
      q.id,
      q.code,
      q.quiz_type,
      qt.name_vi AS quiz_type_name_vi,
      qt.name_es AS quiz_type_name_es,
      q.category_id,
      q.title_vi,
      q.title_es,
      q.description_vi,
      q.description_es,
      q.instructions_vi,
      q.instructions_es,
      q.duration_minutes,
      q.total_questions,
      q.passing_score,
      q.is_active,
      q.created_at
     FROM quizzes q
      LEFT JOIN quiz_types qt ON qt.code = q.quiz_type
     ORDER BY q.created_at DESC`
  );

  return rows;
}

async function updateQuizById(quizId, payload) {
  const [result] = await pool.execute(
    `UPDATE quizzes
     SET category_id = ?,
         quiz_type = ?,
         title_vi = ?,
         title_es = ?,
         description_vi = ?,
         description_es = ?,
         instructions_vi = ?,
         instructions_es = ?,
         passing_score = ?,
         is_active = ?
     WHERE id = ?`,
    [
      payload.category_id || null,
      payload.quiz_type,
      payload.title_vi,
      payload.title_es,
      payload.description_vi || null,
      payload.description_es || null,
      payload.instructions_vi || null,
      payload.instructions_es || null,
      payload.passing_score,
      !!payload.is_active,
      quizId,
    ]
  );

  return result.affectedRows;
}

async function deleteQuizById(quizId) {
  const [result] = await pool.execute('DELETE FROM quizzes WHERE id = ?', [quizId]);
  return result.affectedRows;
}

module.exports = {
  findAllActiveCategories,
  findAllCategoriesForAdmin,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  findAllActiveTypes,
  findAllTypesForAdmin,
  findTypeById,
  createType,
  updateTypeById,
  deleteTypeById,
  countQuizzesByTypeCode,
  findAllActiveQuizzes,
  findQuizById,
  findQuestionsByQuizId,
  findAnswersByQuestionIds,
  createManualQuiz,
  findAllQuizzesForAdmin,
  updateQuizById,
  deleteQuizById,
};
