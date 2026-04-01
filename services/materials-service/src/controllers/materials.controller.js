const materialsService = require('../services/materials.service');
const { getLang } = require('../utils/lang');
const {
  parsePositiveNumber,
  parseRequiredId,
  requireBilingualNames,
} = require('../validators/materials.validator');

async function listSubjects(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listSubjects(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listMaterialCountsBySubject(_req, res, next) {
  try {
    const rows = await materialsService.listMaterialCountsBySubject();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listTopicGroups(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listTopicGroups(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listTopicGroupsAdmin(_req, res, next) {
  try {
    const rows = await materialsService.listTopicGroupsForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createTopicGroup(req, res, next) {
  const { code, name_vi, name_es, description_vi, description_es, is_active } = req.body;
  try {
    requireBilingualNames(name_vi, name_es, 'name_vi and name_es are required');
    const result = await materialsService.createTopicGroup({
      code,
      name_vi,
      name_es,
      description_vi,
      description_es,
      is_active,
      created_by: req.user.id,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateTopicGroup(req, res, next) {
  const { code, name_vi, name_es, description_vi, description_es, is_active } = req.body;
  try {
    const topicGroupId = parseRequiredId(req.params.id, 'id', 'topic group id');
    requireBilingualNames(name_vi, name_es, 'name_vi and name_es are required');
    const result = await materialsService.updateTopicGroup(topicGroupId, {
      code,
      name_vi,
      name_es,
      description_vi,
      description_es,
      is_active,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteTopicGroup(req, res, next) {
  try {
    const topicGroupId = parseRequiredId(req.params.id, 'id', 'topic group id');
    const result = await materialsService.deleteTopicGroup(topicGroupId);
    return res.json(result);
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
  const { name_vi, name_es, description_vi, description_es, material_topic_group_id } = req.body;
  try {
    requireBilingualNames(name_vi, name_es, 'name_vi, name_es are required');
    const topicGroupId = parsePositiveNumber(
      material_topic_group_id,
      'material_topic_group_id',
      1
    );
    const result = await materialsService.createSubject({
      name_vi,
      name_es,
      description_vi,
      description_es,
      material_topic_group_id: topicGroupId,
      created_by: req.user.id,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateSubject(req, res, next) {
  const { name_vi, name_es, description_vi, description_es, material_topic_group_id } = req.body;
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    requireBilingualNames(name_vi, name_es, 'name_vi, name_es are required');
    const topicGroupId = parsePositiveNumber(
      material_topic_group_id,
      'material_topic_group_id',
      1
    );
    const result = await materialsService.updateSubject(subjectId, {
      name_vi,
      name_es,
      description_vi,
      description_es,
      material_topic_group_id: topicGroupId,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteSubject(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const result = await materialsService.deleteSubject(subjectId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function listReferenceMaterials(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listReferenceMaterials(subjectId, lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createReferenceMaterial(req, res, next) {
  const {
    title_vi,
    description_vi,
    file_path_vi,
    file_size_mb_vi,
    page_count_vi,
    title_es,
    description_es,
    file_path_es,
    file_size_mb_es,
    page_count_es,
  } = req.body;
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    if (!title_vi || !file_path_vi || !title_es || !file_path_es) {
      const appError = new Error('title_vi, file_path_vi, title_es, file_path_es are required');
      appError.status = 400;
      throw appError;
    }
    const result = await materialsService.createReferenceMaterial({
      subject_id: subjectId,
      title_vi,
      description_vi,
      file_path_vi,
      file_size_mb_vi,
      page_count_vi,
      title_es,
      description_es,
      file_path_es,
      file_size_mb_es,
      page_count_es,
      uploaded_by: req.user.id,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function createReferenceMaterialsBilingual(req, res, next) {
  const {
    title_vi,
    description_vi,
    file_path_vi,
    file_size_mb_vi,
    page_count_vi,
    title_es,
    description_es,
    file_path_es,
    file_size_mb_es,
    page_count_es,
  } = req.body;

  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    if (!title_vi || !file_path_vi || !title_es || !file_path_es) {
      const appError = new Error('title_vi, file_path_vi, title_es, file_path_es are required');
      appError.status = 400;
      throw appError;
    }
    const result = await materialsService.createReferenceMaterialsBilingual({
      subject_id: subjectId,
      title_vi,
      description_vi,
      file_path_vi,
      file_size_mb_vi,
      page_count_vi,
      title_es,
      description_es,
      file_path_es,
      file_size_mb_es,
      page_count_es,
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

  const {
    title_vi,
    description_vi,
    file_path_vi,
    file_size_mb_vi,
    page_count_vi,
    title_es,
    description_es,
    file_path_es,
    file_size_mb_es,
    page_count_es,
  } = req.body;
  if (!title_vi || !file_path_vi || !title_es || !file_path_es) {
    return res.status(400).json({
      message: 'title_vi, file_path_vi, title_es, file_path_es are required',
    });
  }

  try {
    const result = await materialsService.updateReferenceMaterial(materialId, {
      title_vi,
      description_vi,
      file_path_vi,
      file_size_mb_vi,
      page_count_vi,
      title_es,
      description_es,
      file_path_es,
      file_size_mb_es,
      page_count_es,
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
  listMaterialCountsBySubject,
  listTopicGroups,
  listTopicGroupsAdmin,
  createTopicGroup,
  updateTopicGroup,
  deleteTopicGroup,
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
