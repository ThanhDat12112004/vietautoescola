const express = require('express');
const statsController = require('../../controllers/stats.controller');
const { authRequired } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/leaderboard', statsController.getLeaderboard);
router.get('/me/dashboard', authRequired, statsController.getMyDashboard);
router.get('/users/:id/dashboard', authRequired, statsController.getUserDashboard);

module.exports = router;
