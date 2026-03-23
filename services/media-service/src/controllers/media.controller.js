const mediaService = require('../services/media.service');

function health(_req, res) {
  return res.json({ service: 'media-service', status: 'ok' });
}

async function uploadImage(req, res, next) {
  try {
    const result = await mediaService.uploadQuestionImage(req.file);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function uploadMaterial(req, res, next) {
  try {
    const langCode = req.body?.lang_code;
    const result = await mediaService.uploadMaterialFile(req.file, langCode);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { health, uploadImage, uploadMaterial };
