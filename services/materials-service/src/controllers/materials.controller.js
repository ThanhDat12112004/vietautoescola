const materialsService = require('../services/materials.service');
const { getLang } = require('../utils/lang');

async function listSubjects(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listSubjects(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listSubjectsAdmin(_req, res, next) {
  try {
    const rows = await materialsService.listSubjectsForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createSubject(req, res, next) {
  const { name_vi, name_es, description_vi, description_es } = req.body;

  if (!name_vi || !name_es) {
    return res.status(400).json({ message: 'name_vi, name_es are required' });
  }

  try {
    const result = await materialsService.createSubject({
      name_vi,
      name_es,
      description_vi,
      description_es,
      created_by: req.user.id,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateSubject(req, res, next) {
  const subjectId = Number(req.params.id);
  if (Number.isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject id' });
  }

  const { name_vi, name_es, description_vi, description_es } = req.body;

  if (!name_vi || !name_es) {
    return res.status(400).json({ message: 'name_vi, name_es are required' });
  }

  try {
    const result = await materialsService.updateSubject(subjectId, {
      name_vi,
      name_es,
      description_vi,
      description_es,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteSubject(req, res, next) {
  const subjectId = Number(req.params.id);
  if (Number.isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject id' });
  }

  try {
    const result = await materialsService.deleteSubject(subjectId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function listReferenceMaterials(req, res, next) {
  const subjectId = Number(req.params.id);
  if (Number.isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject id' });
  }

  try {
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listReferenceMaterials(subjectId, lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createReferenceMaterial(req, res, next) {
  const subjectId = Number(req.params.id);
  if (Number.isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject id' });
  }

  const { lang_code, title, description, file_path, file_size_mb } = req.body;
  if (!lang_code || !title || !file_path) {
    return res.status(400).json({ message: 'lang_code, title, file_path are required' });
  }

  try {
    const result = await materialsService.createReferenceMaterial({
      subject_id: subjectId,
      lang_code,
      title,
      description,
      file_path,
      file_size_mb,
      uploaded_by: req.user.id,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function createReferenceMaterialsBilingual(req, res, next) {
  const subjectId = Number(req.params.id);
  if (Number.isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject id' });
  }

  const {
    title_vi,
    description_vi,
    file_path_vi,
    file_size_mb_vi,
    title_es,
    description_es,
    file_path_es,
    file_size_mb_es,
  } = req.body;

  if (!title_vi || !file_path_vi || !title_es || !file_path_es) {
    return res.status(400).json({
      message: 'title_vi, file_path_vi, title_es, file_path_es are required',
    });
  }

  try {
    const result = await materialsService.createReferenceMaterialsBilingual({
      subject_id: subjectId,
      title_vi,
      description_vi,
      file_path_vi,
      file_size_mb_vi,
      title_es,
      description_es,
      file_path_es,
      file_size_mb_es,
      uploaded_by: req.user.id,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateReferenceMaterial(req, res, next) {
  const materialId = Number(req.params.materialId);
  if (Number.isNaN(materialId)) {
    return res.status(400).json({ message: 'Invalid material id' });
  }

  const { title, description, file_path, file_size_mb } = req.body;
  if (!title || !file_path) {
    return res.status(400).json({ message: 'title and file_path are required' });
  }

  try {
    const result = await materialsService.updateReferenceMaterial(materialId, {
      title,
      description,
      file_path,
      file_size_mb,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteReferenceMaterial(req, res, next) {
  const materialId = Number(req.params.materialId);
  if (Number.isNaN(materialId)) {
    return res.status(400).json({ message: 'Invalid material id' });
  }

  try {
    const result = await materialsService.deleteReferenceMaterial(materialId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listSubjects,
  listSubjectsAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
  listReferenceMaterials,
  createReferenceMaterial,
  createReferenceMaterialsBilingual,
  updateReferenceMaterial,
  deleteReferenceMaterial,
};
