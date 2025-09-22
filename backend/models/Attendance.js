const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide student']
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Please provide batch']
  },
  date: {
    type: Date,
    required: [true, 'Please provide date'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide who marked the attendance']
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Prevent duplicate attendance for same student, batch and date
attendanceSchema.index({ student: 1, batch: 1, date: 1 }, { unique: true });

// Add a pre-save hook to validate that the student is enrolled in the batch
attendanceSchema.pre('save', async function(next) {
  const batch = await this.model('Batch').findOne({
    _id: this.batch,
    students: this.student
  });
  
  if (!batch) {
    throw new Error('Student is not enrolled in this batch');
  }
  
  next();
});

// Static method to get attendance summary for a student in a batch
attendanceSchema.statics.getAttendanceSummary = async function(studentId, batchId) {
  const stats = await this.aggregate([
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
    }
  ]);

  // Transform the result into a more usable format
  const result = {
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
