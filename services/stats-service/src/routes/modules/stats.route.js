const express = require('express');
const statsController = require('../../controllers/stats.controller');
const { authRequired } = require('../../middleware/auth.middleware');
const { cacheGet } = require('../../middleware/cache.middleware');

const router = express.Router();

router.get('/leaderboard', cacheGet(15_000), statsController.getLeaderboard);
router.get('/leaderboard/me', authRequired, statsController.getMyLeaderboardRank);
router.get('/leaderboard/me/around', authRequired, statsController.getMyLeaderboardAround);
router.get('/summary', cacheGet(30_000), statsController.getSummary);
router.get('/me/dashboard', authRequired, statsController.getMyDashboard);
router.get('/users/:id/dashboard', authRequired, statsController.getUserDashboard);

module.exports = router;
