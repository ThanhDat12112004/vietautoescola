const { saveImageFile, saveAvatarFile, saveMaterialFile } = require('./storage.service');

const allowedMaterialMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

async function uploadQuestionImage(file) {
  if (!file) {
    const appError = new Error("File is required with field name 'image'");
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveImageFile(file);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

async function uploadAvatarImage(file) {
  if (!file) {
    const appError = new Error("File is required with field name 'image'");
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveAvatarFile(file);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

async function uploadMaterialFile(file, langCode) {
  if (!file) {
    const appError = new Error("File is required with field name 'file'");
    appError.status = 400;
    throw appError;
  }

  if (!['vi', 'es'].includes(langCode)) {
    const appError = new Error("lang_code must be 'vi' or 'es'");
    appError.status = 400;
    throw appError;
  }

  if (!allowedMaterialMimeTypes.has(file.mimetype)) {
    const appError = new Error('Unsupported file type');
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveMaterialFile(file, langCode);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

module.exports = { uploadQuestionImage, uploadAvatarImage, uploadMaterialFile };
