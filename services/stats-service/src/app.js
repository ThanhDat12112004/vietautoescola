const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const statsRoute = require('./routes/modules/stats.route');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  return res.json({ service: 'stats-service', status: 'ok' });
});

app.use('/stats', statsRoute);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
