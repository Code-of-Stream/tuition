const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getAttendances,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  markMultipleAttendances,
  getStudentAttendanceSummary
} = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Attendance = require('../models/Attendance');

router
  .route('/')
  .get(
    advancedResults(Attendance, [
      { path: 'student', select: 'name email' },
      { path: 'markedBy', select: 'name' },
      { path: 'batch', select: 'name subject' }
    ]), 
    getAttendances
  )
  .post(protect, authorize('admin', 'teacher'), createAttendance);

router
  .route('/mark')
  .post(protect, authorize('admin', 'teacher'), markMultipleAttendances);

router
  .route('/summary/student/:studentId/batch/:batchId')
  .get(protect, getStudentAttendanceSummary);

router
  .route('/:id')
  .get(getAttendance)
  .put(protect, authorize('admin', 'teacher'), updateAttendance)
  .delete(protect, authorize('admin', 'teacher'), deleteAttendance);

module.exports = router;
