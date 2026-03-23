const express = require('express');
const authController = require('../../controllers/auth.controller');
const adminUserController = require('../../controllers/admin-user.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout-beacon', authController.logoutBeacon);
router.post('/heartbeat', authRequired, authController.heartbeat);
router.post('/logout', authRequired, authController.logout);
router.patch('/me/avatar', authRequired, authController.updateMyAvatar);
router.patch('/me', authRequired, authController.updateMyProfile);

router.get('/admin/users', authRequired, requireRoles('admin'), adminUserController.listUsers);
router.post('/admin/users', authRequired, requireRoles('admin'), adminUserController.createUser);
router.patch(
  '/admin/users/:id',
  authRequired,
  requireRoles('admin'),
  adminUserController.updateUser
);
router.delete(
  '/admin/users/:id',
  authRequired,
  requireRoles('admin'),
  adminUserController.deleteUser
);
router.post(
  '/admin/users/:id/lock',
  authRequired,
  requireRoles('admin'),
  adminUserController.lockUser
);
router.post(
  '/admin/users/:id/unlock',
  authRequired,
  requireRoles('admin'),
  adminUserController.unlockUser
);

module.exports = router;
