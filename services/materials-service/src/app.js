const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const materialsRoute = require('./routes/modules/materials.route');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  return res.json({ service: 'materials-service', status: 'ok' });
});

app.use('/materials', materialsRoute);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
