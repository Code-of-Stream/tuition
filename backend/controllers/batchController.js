const Batch = require('../models/Batch');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private
exports.getBatches = asyncHandler(async (req, res, next) => {
  // If user is a teacher, only show their batches
  if (req.user.role === 'teacher') {
    req.query.teacher = req.user.id;
  }
  // If user is a student, only show batches they're enrolled in
  else if (req.user.role === 'student') {
    req.query.students = req.user.id;
  }
  
  res.status(200).json(res.advancedResults);
});

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private
exports.getBatch = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id)
    .populate('teacher', 'name email phone')
    .populate('students', 'name email phone');

  if (!batch) {
    return next(
      new ErrorResponse(`Batch not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this batch
  if (
    req.user.role === 'student' && 
    !batch.students.some(s => s._id.toString() === req.user.id) &&
    batch.teacher._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('Not authorized to access this batch', 403)
    );
  }

  res.status(200).json({
    success: true,
    data: batch
  });
});

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private/Admin,Teacher
exports.createBatch = asyncHandler(async (req, res, next) => {
  // Add user to req.body for teacher
  if (req.user.role === 'teacher') {
    req.body.teacher = req.user.id;
  }

  const batch = await Batch.create(req.body);

  res.status(201).json({
    success: true,
    data: batch
  });
});

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private/Admin,Teacher
exports.updateBatch = asyncHandler(async (req, res, next) => {
  let batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(
      new ErrorResponse(`Batch not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is batch teacher or admin
  if (
    batch.teacher.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to update this batch', 403)
    );
  }

  batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: batch
  });
});

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private/Admin,Teacher
exports.deleteBatch = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(
      new ErrorResponse(`Batch not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is batch teacher or admin
  if (
    batch.teacher.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to delete this batch', 403)
    );
  }

  await batch.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add student to batch
// @route   PUT /api/batches/:id/students
// @access  Private/Admin,Teacher
exports.addStudentToBatch = asyncHandler(async (req, res, next) => {
  const { studentId } = req.body;
  
  if (!studentId) {
    return next(new ErrorResponse('Please provide a student ID', 400));
  }

  const batch = await Batch.findById(req.params.id);
  const student = await User.findById(studentId);

  if (!batch || !student) {
    return next(new ErrorResponse('Batch or student not found', 404));
  }

  // Check if student is already in the batch
  if (batch.students.includes(studentId)) {
    return next(new ErrorResponse('Student already in this batch', 400));
  }

  // Check if batch is full
  if (batch.students.length >= batch.maxStudents) {
    return next(new ErrorResponse('Batch is full', 400));
  }

  // Add student to batch
  batch.students.push(studentId);
  await batch.save();

  res.status(200).json({
    success: true,
    data: batch
  });
});

// @desc    Remove student from batch
// @route   DELETE /api/batches/:id/students/:studentId
// @access  Private/Admin,Teacher
exports.removeStudentFromBatch = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);
  const studentId = req.params.studentId;

  if (!batch) {
    return next(
      new ErrorResponse(`Batch not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if student is in the batch
  if (!batch.students.includes(studentId)) {
    return next(new ErrorResponse('Student not in this batch', 400));
  }

  // Remove student from batch
  batch.students = batch.students.filter(id => id.toString() !== studentId);
  await batch.save();

  // TODO: Handle any cleanup (e.g., remove student's attendance records)

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get batch statistics
// @route   GET /api/batches/:id/stats
// @access  Private/Admin,Teacher
exports.getBatchStats = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);
  
  if (!batch) {
    return next(
      new ErrorResponse(`Batch not found with id of ${req.params.id}`, 404)
    );
  }

  // Get attendance stats
  const attendanceStats = await req.model('Attendance').aggregate([
    {
      $match: { batch: batch._id }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get payment stats
  const paymentStats = await req.model('Payment').aggregate([
    {
      $match: { 
        batch: batch._id,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: { $month: '$paymentDate' },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get assignment stats
  const assignmentStats = await req.model('Assignment').aggregate([
    {
      $match: { batch: batch._id }
    },
    {
      $unwind: '$submissions'
    },
    {
      $group: {
        _id: '$submissions.status',
        count: { $sum: 1 },
        averageMarks: { $avg: '$submissions.marksObtained' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      attendance: attendanceStats,
      payments: paymentStats,
      assignments: assignmentStats,
      totalStudents: batch.students.length,
      batchStatus: batch.isActive ? 'Active' : 'Inactive'
    }
  });
});
