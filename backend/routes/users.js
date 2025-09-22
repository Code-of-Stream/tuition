const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserBatches,
  toggleUserStatus,
  getUserStats
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

// All routes below this middleware will be protected and only accessible by admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router
  .route('/:id/batches')
  .get(getUserBatches);

router
  .route('/:id/status')
  .put(toggleUserStatus);

router
  .route('/stats/users')
  .get(getUserStats);

module.exports = router;
