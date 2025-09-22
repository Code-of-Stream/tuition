const Payment = require('../models/Payment');
const Batch = require('../models/Batch');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('student', 'name email phone')
    .populate('batch', 'name subject fee')
    .populate('recordedBy', 'name');

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this payment
  if (
    req.user.role === 'student' && 
    payment.student._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('Not authorized to view this payment', 403)
    );
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private/Admin,Teacher
exports.createPayment = asyncHandler(async (req, res, next) => {
  const { student, batch, month, amount, paymentMethod } = req.body;

  // Check if payment already exists for this student, batch, and month
  const existingPayment = await Payment.findOne({
    student,
    batch,
    month
  });

  if (existingPayment) {
    return next(
      new ErrorResponse('Payment already recorded for this student, batch, and month', 400)
    );
  }

  // Check if student is enrolled in the batch
  const batchDoc = await Batch.findById(batch);
  if (!batchDoc.students.includes(student)) {
    return next(
      new ErrorResponse('Student is not enrolled in this batch', 400)
    );
  }

  // Set default amount to batch fee if not provided
  if (!amount) {
    req.body.amount = batchDoc.fee;
  }

  // Add user who recorded the payment
  req.body.recordedBy = req.user.id;
  
  // Set status to completed for non-online payments
  if (paymentMethod !== 'online') {
    req.body.status = 'completed';
  }

  const payment = await Payment.create(req.body);

  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private/Admin
exports.updatePayment = asyncHandler(async (req, res, next) => {
  let payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent changing student, batch, or month
  if (req.body.student || req.body.batch || req.body.month) {
    return next(
      new ErrorResponse('Cannot change student, batch, or month of a payment', 400)
    );
  }

  payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
exports.deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  await payment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get payment summary for a student
// @route   GET /api/payments/summary/student/:studentId
// @access  Private
exports.getStudentPaymentSummary = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  // Check if user has access to this data
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return next(
      new ErrorResponse('Not authorized to view this payment summary', 403)
    );
  }

  // Get all payments for the student
  const payments = await Payment.find({ 
    student: studentId,
    status: 'completed'
  }).populate('batch', 'name subject fee');

  // Calculate total paid and pending amounts
  let totalPaid = 0;
  let totalPending = 0;
  const batchPayments = {};

  payments.forEach(payment => {
    totalPaid += payment.amount;
    
    // Group by batch
    const batchId = payment.batch._id.toString();
    if (!batchPayments[batchId]) {
      batchPayments[batchId] = {
        batch: payment.batch,
        paid: 0,
        months: new Set()
      };
    }
    
    batchPayments[batchId].paid += payment.amount;
    batchPayments[batchId].months.add(payment.month);
  });

  // Calculate pending payments for each batch
  const batchSummaries = Object.values(batchPayments).map(batch => {
    const monthsPaid = Array.from(batch.months);
    const pendingMonths = []; // TODO: Calculate pending months based on batch duration
    const pendingAmount = batch.batch.fee * pendingMonths.length;
    
    totalPending += pendingAmount;
    
    return {
      batch: batch.batch,
      paid: batch.paid,
      pending: pendingAmount,
      monthsPaid,
      pendingMonths
    };
  });

  res.status(200).json({
    success: true,
    data: {
      totalPaid,
      totalPending,
      batches: batchSummaries
    }
  });
});

// Placeholder: create Razorpay order (not implemented yet)
exports.createRazorpayOrder = asyncHandler(async (req, res, next) => {
  return res.status(501).json({ success: false, message: 'createRazorpayOrder not implemented' });
});

// Placeholder: verify payment webhook (not implemented yet)
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  return res.status(501).json({ success: false, message: 'verifyPayment not implemented' });
});
