const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoute = require('./routes/modules/auth.route');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  return res.json({ service: 'user-service', status: 'ok' });
});

app.use('/auth', authRoute);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
