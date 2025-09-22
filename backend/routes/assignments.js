const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  downloadAssignmentFile,
  deleteAssignmentFile
} = require('../controllers/assignmentController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Assignment = require('../models/Assignment');

// Multer for file uploads
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.FILE_UPLOAD_PATH}/assignments/`);
  },
  filename: (req, file, cb) => {
    cb(null, `assignment_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar|jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document, image, and archive files are allowed'));
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max file size
}).array('files', 5); // Max 5 files

// Middleware to handle file upload
const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }
    next();
  });
};

router
  .route('/')
  .get(
    advancedResults(Assignment, [
      { path: 'assignedBy', select: 'name' },
      { path: 'batch', select: 'name subject' },
      { 
        path: 'submissions.student', 
        select: 'name email' 
      },
      { 
        path: 'submissions.gradedBy', 
        select: 'name' 
      }
    ]), 
    getAssignments
  )
  .post(protect, authorize('admin', 'teacher'), handleFileUpload, createAssignment);

router
  .route('/:id')
  .get(getAssignment)
  .put(protect, authorize('admin', 'teacher'), handleFileUpload, updateAssignment)
  .delete(protect, authorize('admin', 'teacher'), deleteAssignment);

router
  .route('/:id/submit')
  .post(protect, authorize('student'), handleFileUpload, submitAssignment);

router
  .route('/:assignmentId/grade/:studentId')
  .put(protect, authorize('admin', 'teacher'), gradeSubmission);

router
  .route('/:id/files/:fileId')
  .get(protect, downloadAssignmentFile)
  .delete(protect, authorize('admin', 'teacher'), deleteAssignmentFile);

module.exports = router;
