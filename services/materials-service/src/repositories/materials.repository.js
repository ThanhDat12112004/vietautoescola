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
       lang_code,
       title,
       description,
       file_path,
       file_size_mb,
       uploaded_at
     FROM reference_materials
     WHERE material_type_id = ? AND lang_code = ?
     ORDER BY uploaded_at DESC`,
    [subjectId, lang]
  );

  return rows;
}

async function createReferenceMaterial(payload) {
  const randomId = generateRandomMaterialId();
  await pool.execute(
    `INSERT INTO reference_materials
      (id, material_type_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
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
        (id, material_type_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
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
        (id, material_type_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
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
