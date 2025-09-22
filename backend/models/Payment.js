const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Amount cannot be negative']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other'],
    required: [true, 'Please provide payment method']
  },
  transactionId: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  month: {
    type: String,
    required: [true, 'Please provide month for payment'],
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Please provide valid month in YYYY-MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide who recorded the payment']
  },
  paymentDetails: {
    // For storing additional payment gateway response data
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ student: 1, batch: 1, month: 1 }, { unique: true });

// Virtual for payment due date (end of month)
paymentSchema.virtual('dueDate').get(function() {
  const [year, month] = this.month.split('-').map(Number);
  return new Date(year, month, 0); // Last day of the month
});

// Static method to get payment summary for a student in a batch
paymentSchema.statics.getPaymentSummary = async function(studentId, batchId) {
  const result = await this.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        batch: mongoose.Types.ObjectId(batchId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' },
        monthsPaid: { $addToSet: '$month' },
        paymentCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        totalPaid: 1,
        monthsPaid: 1,
        paymentCount: 1
      }
    }
  ]);

  return result.length > 0 ? result[0] : { totalPaid: 0, monthsPaid: [], paymentCount: 0 };
};

// Pre-save hook to generate receipt number if not provided
paymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber && this.status === 'completed') {
    const count = await this.constructor.countDocuments();
    this.receiptNumber = `RCPT-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
