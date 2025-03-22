const express = require('express');
const { 
  getPayments, 
  getPayment, 
  getAppointmentPayments,
  createPayment, 
  updatePayment, 
  deletePayment 
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getPayments)
  .post(protect, createPayment);

router
  .route('/:id')
  .get(protect, getPayment)
  .put(protect, authorize('admin'), updatePayment)
  .delete(protect, authorize('admin'), deletePayment);

router
  .route('/appointment/:appointmentId')
  .get(protect, getAppointmentPayments);

module.exports = router;
