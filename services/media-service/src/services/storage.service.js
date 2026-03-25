const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const mediaStorageDir = process.env.MEDIA_STORAGE_DIR;

if (!mediaStorageDir) {
  throw new Error('Missing MEDIA_STORAGE_DIR in environment');
}

function toPublicMediaPath(relativePath) {
  return `/media/static/${relativePath}`;
}

function sanitizeExtension(filename) {
  if (!filename.includes('.')) {
    return 'bin';
  }

  const extension = filename.split('.').pop().toLowerCase();
  return extension.replace(/[^a-z0-9]/g, '') || 'jpg';
}

async function ensureStorageDir() {
  await fs.mkdir(mediaStorageDir, { recursive: true });
}

async function saveFile(file, dirRelative, defaultExtension = 'bin') {
  await ensureStorageDir();

  const extension = file.originalname.includes('.')
    ? sanitizeExtension(file.originalname)
    : defaultExtension;
  const name = `${randomUUID().replace(/-/g, '')}.${extension}`;
  const relativePath = path.join(dirRelative, name).replace(/\\/g, '/');
  const absoluteDir = path.join(mediaStorageDir, dirRelative);
  const absolutePath = path.join(mediaStorageDir, relativePath);

  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);

  return {
    key: relativePath,
    cdnUrl: toPublicMediaPath(relativePath),
    size: file.size,
  };
}

async function saveImageFile(file) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('questions', String(year)), 'jpg');
}

async function saveMaterialFile(file, langCode) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('materials', langCode, String(year)), 'pdf');
}

module.exports = { saveImageFile, saveMaterialFile };
