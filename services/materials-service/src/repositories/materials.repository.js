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
     FROM material_types
     ORDER BY created_at DESC`
  );

  return rows;
}

async function findAllSubjectsAdmin() {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       name_vi,
       name_es,
       description_vi,
       description_es,
       created_at
          FROM material_types
     ORDER BY created_at DESC`
  );

  return rows;
}

function normalizeSubjectCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase();
}

async function generateNextSubjectCode() {
  const [rows] = await pool.query('SELECT code FROM material_types');
  const usedCodes = new Set();
  let maxIndex = 0;

  for (const row of rows) {
    const normalized = normalizeSubjectCode(row.code);
    if (!normalized) continue;
    usedCodes.add(normalized);
    const match = normalized.match(/^SUB(\d+)$/);
    if (!match) continue;
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric > maxIndex) {
      maxIndex = numeric;
    }
  }

  let next = maxIndex + 1;
  while (true) {
    const candidate = `SUB${String(next).padStart(3, '0')}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
    next += 1;
  }
}

async function createSubject(payload) {
  // Retry a few times in case concurrent inserts pick the same generated code.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = await generateNextSubjectCode();
    try {
      const [result] = await pool.execute(
        `INSERT INTO material_types
          (code, name_vi, name_es, description_vi, description_es, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          code,
          payload.name_vi,
          payload.name_es,
          payload.description_vi || null,
          payload.description_es || null,
          payload.created_by || null,
        ]
      );

      return { id: result.insertId, code };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        continue;
      }
      throw error;
    }
  }

  const appError = new Error('Unable to generate subject code');
  appError.status = 500;
  throw appError;
}

async function updateSubject(subjectId, payload) {
  const [result] = await pool.execute(
    `UPDATE material_types
     SET name_vi = ?,
         name_es = ?,
         description_vi = ?,
         description_es = ?
     WHERE id = ?`,
    [
      payload.name_vi,
      payload.name_es,
      payload.description_vi || null,
      payload.description_es || null,
      subjectId,
    ]
  );

  return result.affectedRows;
}

async function deleteSubject(subjectId) {
  const [result] = await pool.execute('DELETE FROM material_types WHERE id = ?', [subjectId]);
  return result.affectedRows;
}

async function findReferenceMaterials(subjectId, lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       title_vi,
       title_es,
       description_vi,
       description_es,
       file_path_vi,
       file_path_es,
       file_size_mb_vi,
       file_size_mb_es,
       page_count_vi,
       page_count_es,
       CASE WHEN ? = 'es' THEN title_es ELSE title_vi END AS title,
       CASE WHEN ? = 'es' THEN description_es ELSE description_vi END AS description,
       CASE WHEN ? = 'es' THEN file_path_es ELSE file_path_vi END AS file_path,
       CASE WHEN ? = 'es' THEN file_size_mb_es ELSE file_size_mb_vi END AS file_size_mb,
       CASE WHEN ? = 'es' THEN page_count_es ELSE page_count_vi END AS page_count,
       uploaded_at
     FROM reference_materials
     WHERE material_type_id = ?
     ORDER BY uploaded_at DESC`,
    [lang, lang, lang, lang, lang, subjectId]
  );

  return rows;
}

async function createReferenceMaterial(payload) {
  const randomId = generateRandomMaterialId();
  await pool.execute(
    `INSERT INTO reference_materials
      (
        id,
        material_type_id,
        title_vi,
        title_es,
        description_vi,
        description_es,
        file_path_vi,
        file_path_es,
        file_size_mb_vi,
        page_count_vi,
        file_size_mb_es,
        page_count_es,
        uploaded_by
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomId,
      payload.subject_id,
      payload.title_vi,
      payload.title_es,
      payload.description_vi || null,
      payload.description_es || null,
      payload.file_path_vi,
      payload.file_path_es,
      payload.file_size_mb_vi || null,
      payload.page_count_vi != null ? Number(payload.page_count_vi) : null,
      payload.file_size_mb_es || null,
      payload.page_count_es != null ? Number(payload.page_count_es) : null,
      payload.uploaded_by,
    ]
  );

  return randomId;
}

async function createReferenceMaterialsBilingual(payload) {
  const id = await createReferenceMaterial(payload);
  return { id, mode: 'insert' };
}

async function updateReferenceMaterial(materialId, payload) {
  const [result] = await pool.execute(
    `UPDATE reference_materials
     SET title_vi = ?,
         title_es = ?,
         description_vi = ?,
         description_es = ?,
         file_path_vi = ?,
         file_path_es = ?,
         file_size_mb_vi = ?,
         page_count_vi = ?,
         file_size_mb_es = ?,
         page_count_es = ?
     WHERE id = ?`,
    [
      payload.title_vi,
      payload.title_es,
      payload.description_vi || null,
      payload.description_es || null,
      payload.file_path_vi,
      payload.file_path_es,
      payload.file_size_mb_vi || null,
      payload.page_count_vi != null ? Number(payload.page_count_vi) : null,
      payload.file_size_mb_es || null,
      payload.page_count_es != null ? Number(payload.page_count_es) : null,
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
  findAllSubjectsAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
  findReferenceMaterials,
  createReferenceMaterial,
  createReferenceMaterialsBilingual,
  updateReferenceMaterial,
  deleteReferenceMaterial,
};
