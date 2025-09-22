const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// @desc    Get all assignments
// @route   GET /api/assignments
// @route   GET /api/batches/:batchId/assignments
// @access  Private
exports.getAssignments = asyncHandler(async (req, res, next) => {
  if (req.params.batchId) {
    // Get assignments for a specific batch
    const assignments = await Assignment.find({ 
      batch: req.params.batchId,
      isActive: true 
    })
      .populate('assignedBy', 'name')
      .sort('-dueDate');
    
    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('assignedBy', 'name')
    .populate('batch', 'name subject')
    .populate('submissions.student', 'name email')
    .populate('submissions.gradedBy', 'name');

  if (!assignment || !assignment.isActive) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this assignment
  const batch = await Batch.findById(assignment.batch._id);
  if (
    req.user.role === 'student' && 
    !batch.students.includes(req.user.id) &&
    batch.teacher.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('Not authorized to view this assignment', 403)
    );
  }

  // If student, only show their submission
  if (req.user.role === 'student') {
    const studentSubmission = assignment.submissions.find(
      sub => sub.student._id.toString() === req.user.id
    );
    
    assignment.submissions = studentSubmission ? [studentSubmission] : [];
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Teacher
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.assignedBy = req.user.id;

  // Check if batch exists and user is the teacher
  const batch = await Batch.findById(req.body.batch);
  if (!batch) {
    return next(new ErrorResponse(`Batch not found with id of ${req.body.batch}`, 404));
  }

  if (batch.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to create assignments for this batch', 403)
    );
  }

  // Handle file upload if any
  if (req.files && req.files.length > 0) {
    req.body.attachments = await Promise.all(
      req.files.map(async file => {
        // Create custom filename
        const filename = `assignment_${Date.now()}_${file.name}`;
        const filepath = `${process.env.FILE_UPLOAD_PATH}/assignments/${filename}`;
        
        // Move file to uploads directory
        await file.mv(filepath);
        
        return {
          url: `/uploads/assignments/${filename}`,
          filename: file.name,
          mimetype: file.mimetype,
          size: file.size
        };
      })
    );
  }

  const assignment = await Assignment.create(req.body);

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
exports.updateAssignment = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);

  if (!assignment || !assignment.isActive) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the teacher or admin
  const batch = await Batch.findById(assignment.batch);
  if (
    batch.teacher.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to update this assignment', 403)
    );
  }

  // Handle file upload if any
  if (req.files && req.files.length > 0) {
    const newAttachments = await Promise.all(
      req.files.map(async file => {
        const filename = `assignment_${Date.now()}_${file.name}`;
        const filepath = `${process.env.FILE_UPLOAD_PATH}/assignments/${filename}`;
        
        await file.mv(filepath);
        
        return {
          url: `/uploads/assignments/${filename}`,
          filename: file.name,
          mimetype: file.mimetype,
          size: file.size
        };
      })
    );
    
    // Merge with existing attachments
    req.body.attachments = [...(assignment.attachments || []), ...newAttachments];
  }
  
  // Update assignment
  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher,Admin
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the teacher or admin
  const batch = await Batch.findById(assignment.batch);
  if (
    batch.teacher.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to delete this assignment', 403)
    );
  }

  // Delete all associated files
  const fileDeletions = [];
  
  // Delete assignment files
  if (assignment.attachments && assignment.attachments.length > 0) {
    assignment.attachments.forEach(file => {
      fileDeletions.push(
        unlinkAsync(`${process.env.FILE_UPLOAD_PATH}${file.url}`)
          .catch(err => console.error('Error deleting file:', err))
      );
    });
  }
  
  // Delete submission files
  assignment.submissions.forEach(submission => {
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach(file => {
        fileDeletions.push(
          unlinkAsync(`${process.env.FILE_UPLOAD_PATH}${file.url}`)
            .catch(err => console.error('Error deleting file:', err))
        );
      });
    }
  });
  
  // Wait for all file deletions to complete
  await Promise.all(fileDeletions);
  
  // Delete the assignment
  await assignment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment || !assignment.isActive) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if student is enrolled in the batch
  const batch = await Batch.findById(assignment.batch);
  if (!batch.students.includes(req.user.id)) {
    return next(
      new ErrorResponse('You are not enrolled in this batch', 403)
    );
  }

  // Check if submission is allowed (before due date or with late submission)
  const now = new Date();
  const isLate = now > assignment.dueDate;
  
  if (isLate && !assignment.allowLateSubmission) {
    return next(
      new ErrorResponse('Late submissions are not allowed for this assignment', 400)
    );
  }

  // Handle file upload if any
  let submissionFiles = [];
  if (req.files && req.files.length > 0) {
    submissionFiles = await Promise.all(
      req.files.map(async file => {
        const filename = `submission_${Date.now()}_${file.name}`;
        const filepath = `${process.env.FILE_UPLOAD_PATH}/submissions/${filename}`;
        
        await file.mv(filepath);
        
        return {
          url: `/uploads/submissions/${filename}`,
          filename: file.name,
          mimetype: file.mimetype,
          size: file.size
        };
      })
    );
  }

  // Create submission object
  const submission = {
    student: req.user.id,
    submittedAt: now,
    files: submissionFiles,
    notes: req.body.notes || '',
    status: isLate ? 'late' : 'submitted'
  };

  // Check if student has already submitted
  const submissionIndex = assignment.submissions.findIndex(
    sub => sub.student.toString() === req.user.id
  );

  if (submissionIndex >= 0) {
    // Delete old submission files
    const oldFiles = assignment.submissions[submissionIndex].files || [];
    await Promise.all(
      oldFiles.map(file => 
        unlinkAsync(`${process.env.FILE_UPLOAD_PATH}${file.url}`)
          .catch(err => console.error('Error deleting file:', err))
      )
    );
    
    // Update existing submission
    assignment.submissions[submissionIndex] = {
      ...assignment.submissions[submissionIndex].toObject(),
      ...submission,
      status: 'resubmitted',
      resubmittedAt: now
    };
  } else {
    // Add new submission
    assignment.submissions.push(submission);
  }

  await assignment.save();

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Grade assignment submission
// @route   PUT /api/assignments/:assignmentId/grade/:studentId
// @access  Private/Teacher
exports.gradeSubmission = asyncHandler(async (req, res, next) => {
  const { assignmentId, studentId } = req.params;
  const { marksObtained, feedback } = req.body;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment || !assignment.isActive) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${assignmentId}`, 404)
    );
  }

  // Check if user is the teacher or admin
  const batch = await Batch.findById(assignment.batch);
  if (
    batch.teacher.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to grade this assignment', 403)
    );
  }

  // Find the submission
  const submissionIndex = assignment.submissions.findIndex(
    sub => sub.student.toString() === studentId
  );

  if (submissionIndex === -1) {
    return next(
      new ErrorResponse(`No submission found for student ${studentId}`, 404)
    );
  }

  // Update the submission
  assignment.submissions[submissionIndex] = {
    ...assignment.submissions[submissionIndex].toObject(),
    marksObtained,
    feedback,
    gradedBy: req.user.id,
    gradedAt: new Date(),
    status: 'graded'
  };

  await assignment.save();

  res.status(200).json({
    success: true,
    data: assignment.submissions[submissionIndex]
  });
});

// @desc    Download assignment file
// @route   GET /api/assignments/:id/files/:fileId
// @access  Private
exports.downloadAssignmentFile = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment || !assignment.isActive) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Find the file in assignment attachments or submissions
  let file = null;
  
  // Check assignment attachments
  if (assignment.attachments && assignment.attachments.length > 0) {
    file = assignment.attachments.find(f => f._id.toString() === req.params.fileId);
  }
  
  // If not found, check submissions
  if (!file) {
    for (const submission of assignment.submissions) {
      if (submission.files && submission.files.length > 0) {
        const foundFile = submission.files.find(f => f._id.toString() === req.params.fileId);
        if (foundFile) {
          // Check if user has access to this file
          if (
            req.user.role === 'student' && 
            submission.student.toString() !== req.user.id &&
            assignment.assignedBy.toString() !== req.user.id
          ) {
            return next(
              new ErrorResponse('Not authorized to access this file', 403)
            );
          }
          file = foundFile;
          break;
        }
      }
    }
  }

  if (!file) {
    return next(
      new ErrorResponse(`File not found with id of ${req.params.fileId}`, 404)
    );
  }

  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    file.url.startsWith('/') ? file.url.substring(1) : file.url
  );

  res.download(filePath, file.filename, err => {
    if (err) {
      console.error('Error downloading file:', err);
      return next(new ErrorResponse('Error downloading file', 500));
    }
  });
});

// @desc    Delete assignment file
// @route   DELETE /api/assignments/:id/files/:fileId
// @access  Private/Teacher,Admin
exports.deleteAssignmentFile = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the teacher or admin
  const batch = await Batch.findById(assignment.batch);
  if (
    batch.teacher.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to delete files from this assignment', 403)
    );
  }

  let fileFound = false;
  let filePath = '';

  // Check assignment attachments
  if (assignment.attachments && assignment.attachments.length > 0) {
    const fileIndex = assignment.attachments.findIndex(
      f => f._id.toString() === req.params.fileId
    );
    
    if (fileIndex !== -1) {
      filePath = `${process.env.FILE_UPLOAD_PATH}${assignment.attachments[fileIndex].url}`;
      assignment.attachments.splice(fileIndex, 1);
      fileFound = true;
    }
  }

  // If not found in attachments, check submissions
  if (!fileFound) {
    for (const submission of assignment.submissions) {
      if (submission.files && submission.files.length > 0) {
        const fileIndex = submission.files.findIndex(
          f => f._id.toString() === req.params.fileId
        );
        
        if (fileIndex !== -1) {
          filePath = `${process.env.FILE_UPLOAD_PATH}${submission.files[fileIndex].url}`;
          submission.files.splice(fileIndex, 1);
          fileFound = true;
          break;
        }
      }
    }
  }

  if (!fileFound) {
    return next(
      new ErrorResponse(`File not found with id of ${req.params.fileId}`, 404)
    );
  }

  // Delete file from server
  try {
    await unlinkAsync(filePath);
  } catch (err) {
    console.error('Error deleting file:', err);
    // Continue even if file deletion fails
  }

  // Save the updated assignment
  await assignment.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
