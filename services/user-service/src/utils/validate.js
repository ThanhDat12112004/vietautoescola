function validateOrThrow(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const err = new Error('Invalid payload');
    err.status = 400;
    err.details = parsed.error.issues;
    throw err;
  }
  return parsed.data;
}

module.exports = { validateOrThrow };
