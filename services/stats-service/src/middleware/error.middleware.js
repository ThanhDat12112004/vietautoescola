function notFound(_req, res) {
  return res.status(404).json({ message: 'Endpoint not found' });
}

function errorHandler(err, _req, res, _next) {
  return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}

module.exports = { notFound, errorHandler };
