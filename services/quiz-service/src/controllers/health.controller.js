function health(_req, res) {
  return res.json({ service: 'quiz-service', status: 'ok' });
}

module.exports = { health };
