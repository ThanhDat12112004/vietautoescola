function validateOrThrow(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const error = new Error('Invalid payload');
    error.status = 400;
    error.details = parsed.error.issues;
    throw error;
  }

  return parsed.data;
}

module.exports = { validateOrThrow };
