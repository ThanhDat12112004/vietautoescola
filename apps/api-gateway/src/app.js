const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const proxyRoute = require('./routes/modules/proxy.route');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get('/health', (_req, res) => {
  return res.json({ service: 'api-gateway', status: 'ok' });
});

app.use(proxyRoute);

module.exports = app;
