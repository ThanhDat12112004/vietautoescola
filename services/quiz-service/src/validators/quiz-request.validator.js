function parseRequiredId(value, label) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    const error = new Error(`Invalid ${label}`);
    error.status = 400;
    throw error;
  }
  return parsed;
}

function requireBilingualNames(nameVi, nameEs) {
  if (!nameVi || !nameEs) {
    const error = new Error('name_vi and name_es are required');
    error.status = 400;
    throw error;
  }
}

function parsePositiveNumber(value, fieldName, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a positive number`);
    error.status = 400;
    throw error;
  }
  return parsed;
}

function parseOptionalPositiveNumber(value, fieldName) {
  if (value == null) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be positive number`);
    error.status = 400;
    throw error;
  }
  return parsed;
}

module.exports = {
  parseRequiredId,
  requireBilingualNames,
  parsePositiveNumber,
  parseOptionalPositiveNumber,
};
