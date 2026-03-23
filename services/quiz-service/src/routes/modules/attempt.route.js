const express = require('express');
const attemptController = require('../../controllers/attempt.controller');
const { authRequired } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/attempts/start', authRequired, attemptController.startAttempt);
router.post('/attempts/:id/check-question', authRequired, attemptController.checkQuestion);
router.post('/attempts/:id/submit', authRequired, attemptController.submitAttempt);

module.exports = router;
