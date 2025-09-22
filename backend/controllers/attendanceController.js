const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @route   GET /api/batches/:batchId/attendance
// @access  Private
exports.getAttendances = asyncHandler(async (req, res, next) => {
  if (req.params.batchId) {
    // Get attendance for a specific batch
    const attendances = await Attendance.find({ batch: req.params.batchId })
      .populate('student', 'name email')
      .populate('markedBy', 'name');
    
    return res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('student', 'name email')
    .populate('batch', 'name subject')
    .populate('markedBy', 'name');

  if (!attendance) {
    return next(
      new ErrorResponse(`Attendance not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user has access to this attendance record
  if (
    req.user.role === 'student' && 
    attendance.student._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('Not authorized to view this attendance record', 403)
    );
  }

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private/Admin,Teacher
exports.createAttendance = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.markedBy = req.user.id;
  
  // Check if attendance already exists for this student, batch, and date
  const existingAttendance = await Attendance.findOne({
    student: req.body.student,
    batch: req.body.batch,
    date: {
      $gte: new Date(new Date(req.body.date).setHours(0, 0, 0)),
      $lt: new Date(new Date(req.body.date).setHours(23, 59, 59))
    }
  });

  if (existingAttendance) {
    return next(
      new ErrorResponse('Attendance already marked for this student on this date', 400)
    );
  }

  // Check if student is enrolled in the batch
  const batch = await Batch.findById(req.body.batch);
  if (!batch.students.includes(req.body.student)) {
    return next(
      new ErrorResponse('Student is not enrolled in this batch', 400)
    );
  }

  const attendance = await Attendance.create(req.body);

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin,Teacher
exports.updateAttendance = asyncHandler(async (req, res, next) => {
  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(
      new ErrorResponse(`Attendance not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to update this attendance
  if (
    attendance.markedBy.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to update this attendance record', 403)
    );
  }

  attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin,Teacher
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(
      new ErrorResponse(`Attendance not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to delete this attendance
  if (
    attendance.markedBy.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to delete this attendance record', 403)
    );
  }

  await attendance.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark multiple attendances
// @route   POST /api/attendance/mark
// @access  Private/Admin,Teacher
exports.markMultipleAttendances = asyncHandler(async (req, res, next) => {
  const { batchId, date, attendances } = req.body;

  if (!batchId || !date || !attendances || !Array.isArray(attendances)) {
    return next(
      new ErrorResponse('Please provide batchId, date, and an array of attendances', 400)
    );
  }

  // Check if user is the teacher of this batch or admin
  const batch = await Batch.findById(batchId);
  if (!batch) {
    return next(new ErrorResponse('Batch not found', 404));
  }

  if (batch.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to mark attendance for this batch', 403)
    );
  }

  // Process each attendance
  const results = [];
  const errors = [];
  
  for (const att of attendances) {
    try {
      // Check if student is in the batch
      if (!batch.students.includes(att.student)) {
        errors.push(`Student ${att.student} is not in this batch`);
        continue;
      }

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        student: att.student,
        batch: batchId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0)),
          $lt: new Date(new Date(date).setHours(23, 59, 59))
        }
      });

      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = att.status;
        existingAttendance.notes = att.notes || '';
        existingAttendance.markedBy = req.user.id;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        // Create new attendance
        const newAttendance = await Attendance.create({
          student: att.student,
          batch: batchId,
          date,
          status: att.status,
          notes: att.notes || '',
          markedBy: req.user.id
        });
        results.push(newAttendance);
      }
    } catch (err) {
      errors.push(`Error processing student ${att.student}: ${err.message}`);
    }
  }

  res.status(200).json({
    success: errors.length === 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
    message: errors.length > 0 
      ? `Processed with ${errors.length} error(s)` 
      : 'Attendance marked successfully'
  });
});

// @desc    Get attendance summary for a student in a batch
// @route   GET /api/attendance/summary/student/:studentId/batch/:batchId
// @access  Private
exports.getStudentAttendanceSummary = asyncHandler(async (req, res, next) => {
  const { studentId, batchId } = req.params;

  // Check if student is in the batch
  const batch = await Batch.findById(batchId);
  if (!batch) {
    return next(new ErrorResponse('Batch not found', 404));
  }

  // Make sure the requesting user has access to this data
  if (
    req.user.role === 'student' && 
    req.user.id !== studentId &&
    req.user.id !== batch.teacher.toString()
  ) {
    return next(
      new ErrorResponse('Not authorized to view this attendance summary', 403)
    );
  }

  // Get attendance summary
  const summary = await Attendance.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        batch: mongoose.Types.ObjectId(batchId)
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1
      }
    }
  ]);

  // Calculate total and percentage
  const total = summary.reduce((acc, curr) => acc + curr.count, 0);
  const present = summary.find(s => s.status === 'present')?.count || 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      summary,
      total,
      percentage,
      student: studentId,
      batch: batchId
    }
  });
});
