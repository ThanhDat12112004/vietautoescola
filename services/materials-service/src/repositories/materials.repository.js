const pool = require('../config/db');
const { randomInt } = require('crypto');

function generateRandomMaterialId() {
  // Keep values in BIGINT-safe range and reserve enough entropy.
  return randomInt(1_000_000_000, 9_999_999_999_999);
}

async function findUserSessionById(userId) {
  const [rows] = await pool.execute(
    'SELECT id, role, is_active, current_session_id FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  return rows[0] || null;
}

async function findSubjects(lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       ${lang === 'es' ? 'name_es' : 'name_vi'} AS name,
       ${lang === 'es' ? 'description_es' : 'description_vi'} AS description,
       created_at
     FROM subjects
     ORDER BY created_at DESC`
  );

  return rows;
}

async function findReferenceMaterials(subjectId, lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       lang_code,
       title,
       description,
       file_path,
       file_size_mb,
       uploaded_at
     FROM reference_materials
     WHERE subject_id = ? AND lang_code = ?
     ORDER BY uploaded_at DESC`,
    [subjectId, lang]
  );

  return rows;
}

async function createReferenceMaterial(payload) {
  const randomId = generateRandomMaterialId();
  await pool.execute(
    `INSERT INTO reference_materials
      (id, subject_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomId,
      payload.subject_id,
      payload.lang_code,
      payload.title,
      payload.description || null,
      payload.file_path,
      payload.file_size_mb || null,
      payload.uploaded_by,
    ]
  );

  return randomId;
}

async function createReferenceMaterialsBilingual(payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const randomIdVi = generateRandomMaterialId();
    const randomIdEs = generateRandomMaterialId();

    await connection.execute(
      `INSERT INTO reference_materials
        (id, subject_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
       VALUES (?, ?, 'vi', ?, ?, ?, ?, ?)`,
      [
        randomIdVi,
        payload.subject_id,
        payload.title_vi,
        payload.description_vi || null,
        payload.file_path_vi,
        payload.file_size_mb_vi || null,
        payload.uploaded_by,
      ]
    );

    await connection.execute(
      `INSERT INTO reference_materials
        (id, subject_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
       VALUES (?, ?, 'es', ?, ?, ?, ?, ?)`,
      [
        randomIdEs,
        payload.subject_id,
        payload.title_es,
        payload.description_es || null,
        payload.file_path_es,
        payload.file_size_mb_es || null,
        payload.uploaded_by,
      ]
    );

    await connection.commit();
    return {
      vi_id: randomIdVi,
      es_id: randomIdEs,
      mode: 'insert',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateReferenceMaterial(materialId, payload) {
  const [result] = await pool.execute(
    `UPDATE reference_materials
     SET title = ?, description = ?, file_path = ?, file_size_mb = ?
     WHERE id = ?`,
    [
      payload.title,
      payload.description || null,
      payload.file_path,
      payload.file_size_mb || null,
      materialId,
    ]
  );

  return result.affectedRows;
}

async function deleteReferenceMaterial(materialId) {
  const [result] = await pool.execute('DELETE FROM reference_materials WHERE id = ?', [materialId]);
  return result.affectedRows;
}

module.exports = {
  findUserSessionById,
  findSubjects,
  findReferenceMaterials,
  createReferenceMaterial,
  createReferenceMaterialsBilingual,
  updateReferenceMaterial,
  deleteReferenceMaterial,
};
