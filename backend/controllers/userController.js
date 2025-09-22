const User = require('../models/User');
const Batch = require('../models/Batch');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Prevent deleting own account
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse(`You cannot delete your own account`, 400));
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user's batches
// @route   GET /api/users/:id/batches
// @access  Private
exports.getUserBatches = asyncHandler(async (req, res, next) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to access this resource', 403)
    );
  }

  let query;
  
  // If user is a teacher, get batches they teach
  if (req.user.role === 'teacher') {
    query = Batch.find({ teacher: req.params.id });
  } 
  // If user is a student, get batches they're enrolled in
  else if (req.user.role === 'student') {
    query = Batch.find({ students: req.params.id });
  }
  // Admin can see all batches
  else {
    query = Batch.find({});
  }

  // Select fields
  query = query.select('name subject schedule fee startDate endDate');

  // Execute query
  const batches = await query;

  res.status(200).json({
    success: true,
    count: batches.length,
    data: batches
  });
});

// @desc    Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent deactivating own account
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot deactivate your own account', 400));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        inactive: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
        },
        lastMonth: {
          $sum: {
            $cond: [
              { $gt: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});
