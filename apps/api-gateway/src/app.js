const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const proxyRoute = require('./routes/modules/proxy.route');

const app = express();

// Trust first proxy hop (ngrok/reverse proxy) for correct client IP detection.
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        frameAncestors: [
          "'self'",
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https:',
        ],
      },
    },
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
