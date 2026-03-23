const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

const userServiceUrl = process.env.USER_SERVICE_URL;
const quizServiceUrl = process.env.QUIZ_SERVICE_URL;
const mediaServiceUrl = process.env.MEDIA_SERVICE_URL;
const statsServiceUrl = process.env.STATS_SERVICE_URL;
const materialsServiceUrl = process.env.MATERIALS_SERVICE_URL;

if (!userServiceUrl || !quizServiceUrl || !mediaServiceUrl || !statsServiceUrl || !materialsServiceUrl) {
  throw new Error('Missing one or more downstream service URLs in environment');
}

function proxyWithPrefix(prefix, target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${prefix}${path}`,
  });
}

router.use(
  '/auth',
  proxyWithPrefix('/auth', userServiceUrl)
);

router.use(
  '/api',
  proxyWithPrefix('/api', quizServiceUrl)
);

router.use(
  '/media',
  proxyWithPrefix('/media', mediaServiceUrl)
);

router.use(
  '/stats',
  proxyWithPrefix('/stats', statsServiceUrl)
);

router.use(
  '/materials',
  proxyWithPrefix('/materials', materialsServiceUrl)
);

module.exports = router;
