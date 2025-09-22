const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  addStudentToBatch,
  removeStudentFromBatch,
  getBatchStats
} = require('../controllers/batchController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Batch = require('../models/Batch');

// Include other resource routers
const attendanceRouter = require('./attendance');
const materialRouter = require('./materials');
const assignmentRouter = require('./assignments');

// Re-route into other resource routers
router.use('/:batchId/attendance', attendanceRouter);
router.use('/:batchId/materials', materialRouter);
router.use('/:batchId/assignments', assignmentRouter);

router
  .route('/')
  .get(
    advancedResults(Batch, [
      { path: 'teacher', select: 'name email' },
      { path: 'students', select: 'name email' }
    ]), 
    getBatches
  )
  .post(protect, authorize('admin', 'teacher'), createBatch);

router
  .route('/:id')
  .get(getBatch)
  .put(protect, authorize('admin', 'teacher'), updateBatch)
  .delete(protect, authorize('admin', 'teacher'), deleteBatch);

router
  .route('/:id/students')
  .post(protect, authorize('admin', 'teacher'), addStudentToBatch);

router
  .route('/:id/students/:studentId')
  .delete(protect, authorize('admin', 'teacher'), removeStudentFromBatch);

router
  .route('/:id/stats')
  .get(protect, getBatchStats);

module.exports = router;
