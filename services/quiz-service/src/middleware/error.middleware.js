function notFound(_req, res) {
  return res.status(404).json({ message: 'Endpoint not found' });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const response = { message: err.message || 'Internal server error' };

  if (err.details) {
    response.errors = err.details;
  }

  return res.status(status).json(response);
}

module.exports = { notFound, errorHandler };
