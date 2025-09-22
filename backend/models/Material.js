const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide material title'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Please provide batch']
  },
  file: {
    url: {
      type: String,
      required: [true, 'Please provide file URL']
    },
    filename: String,
    mimetype: String,
    size: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide uploader']
  },
  tags: [{
    type: String,
    trim: true
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

// Text index for search functionality
materialSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Add a pre-save hook to validate that the uploader is the teacher of the batch
materialSchema.pre('save', async function(next) {
  const batch = await this.model('Batch').findOne({
    _id: this.batch,
    teacher: this.uploadedBy
  });
  
  if (!batch) {
    throw new Error('Only the assigned teacher can upload materials for this batch');
  }
  
  next();
});

module.exports = mongoose.model('Material', materialSchema);
