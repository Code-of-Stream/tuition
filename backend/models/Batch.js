const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide batch name'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  subject: {
    type: String,
    required: [true, 'Please provide subject'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a teacher to this batch']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: {
      type: String,
      required: [true, 'Please provide class start time']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide class end time']
    }
  },
  fee: {
    type: Number,
    required: [true, 'Please provide monthly fee for this batch']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide batch start date']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.startDate || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: [1, 'Maximum students must be at least 1']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting batch duration in months
batchSchema.virtual('durationInMonths').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const months = (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12;
  return months + this.endDate.getMonth() - this.startDate.getMonth();
});

// Cascade delete attendances when a batch is deleted
batchSchema.pre('remove', async function(next) {
  await this.model('Attendance').deleteMany({ batch: this._id });
  await this.model('Material').deleteMany({ batch: this._id });
  await this.model('Assignment').deleteMany({ batch: this._id });
  next();
});

// Index for better query performance
batchSchema.index({ teacher: 1, isActive: 1 });

module.exports = mongoose.model('Batch', batchSchema);
