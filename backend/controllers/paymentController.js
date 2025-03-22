const db = require('../config/firebase');

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private/Admin
 */
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await db.getAll('payments');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payment
 * @route   GET /api/payments/:id
 * @access  Private/Admin or Patient
 */
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await db.getById('payments', req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Get appointment to check patient ID
    const appointment = await db.getById('appointments', payment.Appointment_ID);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Associated appointment not found'
      });
    }
    
    // Check if user is authorized to view this payment
    if (
      req.user.role !== 'admin' && 
      req.user.id !== appointment.Patient_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payments for an appointment
 * @route   GET /api/payments/appointment/:appointmentId
 * @access  Private/Admin or Patient
 */
exports.getAppointmentPayments = async (req, res, next) => {
  try {
    // Get appointment to check patient ID
    const appointment = await db.getById('appointments', req.params.appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to view these payments
    if (
      req.user.role !== 'admin' && 
      req.user.id !== appointment.Patient_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these payments'
      });
    }
    
    const payments = await db.query('payments', [
      ['Appointment_ID', '==', req.params.appointmentId]
    ]);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new payment
 * @route   POST /api/payments
 * @access  Private/Patient
 */
exports.createPayment = async (req, res, next) => {
  try {
    const {
      Appointment_ID,
      Amount,
      Payment_Mode,
      Transaction_ID
    } = req.body;
    
    // Check if appointment exists
    const appointment = await db.getById('appointments', Appointment_ID);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to create this payment
    if (req.user.role === 'patient' && req.user.id !== appointment.Patient_ID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create payment for another patient'
      });
    }
    
    // Create payment
    const payment = await db.create('payments', {
      Appointment_ID,
      Amount,
      Payment_Mode,
      Transaction_ID,
      Payment_Status: 'Completed'
    });
    
    // Update appointment payment status
    await db.update('appointments', Appointment_ID, {
      Payment_Status: 'Paid'
    });
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment
 * @route   PUT /api/payments/:id
 * @access  Private/Admin
 */
exports.updatePayment = async (req, res, next) => {
  try {
    // Check if payment exists
    let payment = await db.getById('payments', req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Only admin can update payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payments'
      });
    }
    
    // Update payment
    const updatedPayment = await db.update('payments', req.params.id, req.body);
    
    // If payment status is updated, update appointment payment status as well
    if (req.body.Payment_Status) {
      await db.update('appointments', payment.Appointment_ID, {
        Payment_Status: req.body.Payment_Status === 'Completed' ? 'Paid' : 'Pending'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment
 * @route   DELETE /api/payments/:id
 * @access  Private/Admin
 */
exports.deletePayment = async (req, res, next) => {
  try {
    // Check if payment exists
    const payment = await db.getById('payments', req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Only admin can delete payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete payments'
      });
    }
    
    // Delete payment
    await db.delete('payments', req.params.id);
    
    // Update appointment payment status
    await db.update('appointments', payment.Appointment_ID, {
      Payment_Status: 'Pending'
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
