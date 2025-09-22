const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  createRazorpayOrder,
  verifyPayment,
  getStudentPaymentSummary
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Payment = require('../models/Payment');

// Public route for Razorpay webhook
router.post('/verify', verifyPayment);

// All other routes are protected
router.use(protect);

router
  .route('/')
  .get(
    advancedResults(Payment, [
      { path: 'student', select: 'name email' },
      { path: 'batch', select: 'name subject' },
      { path: 'recordedBy', select: 'name' }
    ]), 
    getPayments
  )
  .post(authorize('admin', 'teacher'), createPayment);

router
  .route('/create-order')
  .post(createRazorpayOrder);

router
  .route('/summary/student/:studentId')
  .get(getStudentPaymentSummary);

router
  .route('/:id')
  .get(getPayment)
  .put(authorize('admin'), updatePayment)
  .delete(authorize('admin'), deletePayment);

module.exports = router;
