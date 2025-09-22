const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide assignment title'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Please provide batch']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide who assigned this assignment']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please provide total marks'],
    min: [1, 'Total marks must be at least 1']
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    files: [{
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    }],
    notes: {
      type: String,
      maxlength: 1000
    },
    marksObtained: {
      type: Number,
      min: [0, 'Marks cannot be negative'],
      max: [function() { return this.totalMarks; }, 'Marks cannot exceed total marks']
    },
    feedback: {
      type: String,
      maxlength: 1000
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date,
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late', 'resubmitted'],
      default: 'submitted'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
assignmentSchema.index({ batch: 1, dueDate: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Virtual for submission status
assignmentSchema.virtual('submissionStatus').get(function() {
  const now = new Date();
  return {
    isDue: now > this.dueDate,
    daysRemaining: Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24))
  };
});

// Method to add a submission
assignmentSchema.methods.addSubmission = async function(studentId, files, notes) {
  const existingSubmissionIndex = this.submissions.findIndex(
    sub => sub.student.toString() === studentId.toString()
  );

  const submission = {
    student: studentId,
    submittedAt: new Date(),
    files: files || [],
    notes: notes || '',
    status: this.dueDate < new Date() ? 'late' : 'submitted'
  };

  if (existingSubmissionIndex >= 0) {
    // Update existing submission
    this.submissions[existingSubmissionIndex] = {
      ...this.submissions[existingSubmissionIndex].toObject(),
      ...submission,
      status: 'resubmitted'
    };
  } else {
    // Add new submission
    this.submissions.push(submission);
  }

  await this.save();
  return this;
};

// Method to grade a submission
assignmentSchema.methods.gradeSubmission = async function(studentId, marks, feedback, gradedBy) {
  const submission = this.submissions.find(
    sub => sub.student.toString() === studentId.toString()
  );

  if (!submission) {
    throw new Error('No submission found for this student');
  }

  submission.marksObtained = marks;
  submission.feedback = feedback;
  submission.gradedBy = gradedBy;
  submission.gradedAt = new Date();
  submission.status = 'graded';

  await this.save();
  return this;
};

module.exports = mongoose.model('Assignment', assignmentSchema);
