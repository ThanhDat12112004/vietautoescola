const materialsRepository = require('../repositories/materials.repository');

function normalizeMediaPath(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }
}

function normalizeMaterialFilePaths(payload = {}) {
  return {
    ...payload,
    file_path_vi: normalizeMediaPath(payload.file_path_vi),
    file_path_es: normalizeMediaPath(payload.file_path_es),
  };
}

async function listSubjects(lang) {
  return materialsRepository.findSubjects(lang);
}

async function listTopicGroups(lang) {
  return materialsRepository.findAllTopicGroups(lang);
}

async function listTopicGroupsForAdmin() {
  return materialsRepository.findAllTopicGroupsForAdmin();
}

async function createTopicGroup(payload) {
  try {
    const id = await materialsRepository.createTopicGroup(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Topic group code already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function updateTopicGroup(topicGroupId, payload) {
  try {
    const affected = await materialsRepository.updateTopicGroupById(topicGroupId, payload);
    if (!affected) {
      const appError = new Error('Topic group not found');
      appError.status = 404;
      throw appError;
    }
    return { id: topicGroupId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Topic group code already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function deleteTopicGroup(topicGroupId) {
  const usedCount = await materialsRepository.countSubjectsByTopicGroupId(topicGroupId);
  if (usedCount > 0) {
    const appError = new Error('Cannot delete topic group because it is being used');
    appError.status = 409;
    throw appError;
  }
  const affected = await materialsRepository.deleteTopicGroupById(topicGroupId);
  if (!affected) {
    const appError = new Error('Topic group not found');
    appError.status = 404;
    throw appError;
  }
  return { id: topicGroupId };
}

async function listSubjectsForAdmin() {
  return materialsRepository.findAllSubjectsAdmin();
}

async function createSubject(payload) {
  try {
    return await materialsRepository.createSubject(payload);
  } catch (error) {
    throw error;
  }
}

async function updateSubject(subjectId, payload) {
  const affected = await materialsRepository.updateSubject(subjectId, payload);

  if (!affected) {
    const appError = new Error('Subject not found');
    appError.status = 404;
    throw appError;
  }

  return { id: subjectId };
}

async function deleteSubject(subjectId) {
  try {
    const affected = await materialsRepository.deleteSubject(subjectId);

    if (!affected) {
      const appError = new Error('Subject not found');
      appError.status = 404;
      throw appError;
    }

    return { id: subjectId };
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      const appError = new Error('Cannot delete subject because it is being used');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function listReferenceMaterials(subjectId, lang) {
  return materialsRepository.findReferenceMaterials(subjectId, lang);
}

async function createReferenceMaterial(payload) {
  try {
    const id = await materialsRepository.createReferenceMaterial(normalizeMaterialFilePaths(payload));
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Material already exists for this subject');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function createReferenceMaterialsBilingual(payload) {
  try {
    const ids = await materialsRepository.createReferenceMaterialsBilingual(
      normalizeMaterialFilePaths(payload)
    );
    return ids;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Material already exists for this subject');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function updateReferenceMaterial(materialId, payload) {
  const affected = await materialsRepository.updateReferenceMaterial(
    materialId,
    normalizeMaterialFilePaths(payload)
  );

  if (!affected) {
    const appError = new Error('Material not found');
    appError.status = 404;
    throw appError;
  }

  return { id: materialId };
}

async function deleteReferenceMaterial(materialId) {
  const affected = await materialsRepository.deleteReferenceMaterial(materialId);

  if (!affected) {
    const appError = new Error('Material not found');
    appError.status = 404;
    throw appError;
  }

  return { id: materialId };
}

module.exports = {
  listTopicGroups,
  listTopicGroupsForAdmin,
  createTopicGroup,
  updateTopicGroup,
  deleteTopicGroup,
  listSubjects,
  listSubjectsForAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
  listReferenceMaterials,
  createReferenceMaterial,
  createReferenceMaterialsBilingual,
  updateReferenceMaterial,
  deleteReferenceMaterial,
};
