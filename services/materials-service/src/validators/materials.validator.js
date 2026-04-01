function parseRequiredId(value, _fieldName, label) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    const error = new Error(`Invalid ${label}`);
    error.status = 400;
    error.payload = { message: `Invalid ${label}` };
    throw error;
  }
  return parsed;
}

function requireBilingualNames(nameVi, nameEs, message) {
  if (!nameVi || !nameEs) {
    const error = new Error(message);
    error.status = 400;
    error.payload = { message };
    throw error;
  }
}

function parsePositiveNumber(value, fieldName, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be a positive number`);
    error.status = 400;
    error.payload = { message: `${fieldName} must be a positive number` };
    throw error;
  }
  return parsed;
}

module.exports = {
  parseRequiredId,
  requireBilingualNames,
  parsePositiveNumber,
};
