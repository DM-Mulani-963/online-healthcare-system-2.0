const db = require('../config/firebase');

/**
 * @desc    Get all appointments
 * @route   GET /api/appointments
 * @access  Private/Admin
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const appointments = await db.getAll('appointments');
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment
 * @route   GET /api/appointments/:id
 * @access  Private/Admin or Patient or Doctor
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await db.getById('appointments', req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to view this appointment
    if (
      req.user.role !== 'admin' && 
      req.user.id !== appointment.Patient_ID && 
      req.user.id !== appointment.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for a patient
 * @route   GET /api/appointments/patient/:patientId
 * @access  Private/Admin or Patient
 */
exports.getPatientAppointments = async (req, res, next) => {
  try {
    // Check if user is authorized to view these appointments
    if (req.user.role !== 'admin' && req.user.id !== req.params.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these appointments'
      });
    }
    
    const appointments = await db.query('appointments', [
      ['Patient_ID', '==', req.params.patientId]
    ]);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for a doctor
 * @route   GET /api/appointments/doctor/:doctorId
 * @access  Private/Admin or Doctor
 */
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    // Check if user is authorized to view these appointments
    if (req.user.role !== 'admin' && req.user.id !== req.params.doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these appointments'
      });
    }
    
    const appointments = await db.query('appointments', [
      ['Doctor_ID', '==', req.params.doctorId]
    ]);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private/Patient
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      Patient_ID,
      Doctor_ID,
      Date,
      Time,
      Mode
    } = req.body;
    
    // Check if patient exists
    const patient = await db.getById('patients', Patient_ID);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if doctor exists
    const doctor = await db.getById('doctors', Doctor_ID);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if user is authorized to create this appointment
    if (req.user.role === 'patient' && req.user.id !== Patient_ID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create appointment for another patient'
      });
    }
    
    // Create appointment
    const appointment = await db.create('appointments', {
      Patient_ID,
      Doctor_ID,
      Date,
      Time,
      Status: 'Pending',
      Mode,
      Payment_Status: 'Pending'
    });
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private/Admin or Doctor
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    // Check if appointment exists
    let appointment = await db.getById('appointments', req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to update this appointment
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'doctor' && 
      req.user.id !== appointment.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    // Update appointment
    const updatedAppointment = await db.update('appointments', req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private/Admin or Patient
 */
exports.deleteAppointment = async (req, res, next) => {
  try {
    // Check if appointment exists
    const appointment = await db.getById('appointments', req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to delete this appointment
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'patient' || req.user.id !== appointment.Patient_ID)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }
    
    // Delete appointment
    await db.delete('appointments', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
