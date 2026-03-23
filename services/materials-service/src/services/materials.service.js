const materialsRepository = require('../repositories/materials.repository');

async function listSubjects(lang) {
  return materialsRepository.findSubjects(lang);
}

async function listReferenceMaterials(subjectId, lang) {
  return materialsRepository.findReferenceMaterials(subjectId, lang);
}

async function createReferenceMaterial(payload) {
  try {
    const id = await materialsRepository.createReferenceMaterial(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Material already exists for this subject/language');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function createReferenceMaterialsBilingual(payload) {
  try {
    const ids = await materialsRepository.createReferenceMaterialsBilingual(payload);
    return ids;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Material already exists for this subject/language');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function updateReferenceMaterial(materialId, payload) {
  const affected = await materialsRepository.updateReferenceMaterial(materialId, payload);

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
  listSubjects,
  listReferenceMaterials,
  createReferenceMaterial,
  createReferenceMaterialsBilingual,
  updateReferenceMaterial,
  deleteReferenceMaterial,
};
