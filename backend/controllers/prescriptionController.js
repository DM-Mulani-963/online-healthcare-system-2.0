const db = require('../config/firebase');

/**
 * @desc    Get all prescriptions
 * @route   GET /api/prescriptions
 * @access  Private/Admin
 */
exports.getPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await db.getAll('prescriptions');
    
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single prescription
 * @route   GET /api/prescriptions/:id
 * @access  Private/Admin or Patient or Doctor
 */
exports.getPrescription = async (req, res, next) => {
  try {
    const prescription = await db.getById('prescriptions', req.params.id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check if user is authorized to view this prescription
    if (
      req.user.role !== 'admin' && 
      req.user.id !== prescription.Patient_ID && 
      req.user.id !== prescription.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this prescription'
      });
    }
    
    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prescriptions for a patient
 * @route   GET /api/prescriptions/patient/:patientId
 * @access  Private/Admin or Patient
 */
exports.getPatientPrescriptions = async (req, res, next) => {
  try {
    // Check if user is authorized to view these prescriptions
    if (req.user.role !== 'admin' && req.user.id !== req.params.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these prescriptions'
      });
    }
    
    const prescriptions = await db.query('prescriptions', [
      ['Patient_ID', '==', req.params.patientId]
    ]);
    
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prescriptions for a doctor
 * @route   GET /api/prescriptions/doctor/:doctorId
 * @access  Private/Admin or Doctor
 */
exports.getDoctorPrescriptions = async (req, res, next) => {
  try {
    // Check if user is authorized to view these prescriptions
    if (req.user.role !== 'admin' && req.user.id !== req.params.doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these prescriptions'
      });
    }
    
    const prescriptions = await db.query('prescriptions', [
      ['Doctor_ID', '==', req.params.doctorId]
    ]);
    
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new prescription
 * @route   POST /api/prescriptions
 * @access  Private/Doctor
 */
exports.createPrescription = async (req, res, next) => {
  try {
    const {
      Patient_ID,
      Doctor_ID,
      Appointment_ID,
      Medicine_Name,
      Dosage,
      Frequency,
      Instructions,
      Refill
    } = req.body;
    
    // Check if appointment exists
    const appointment = await db.getById('appointments', Appointment_ID);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
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
    
    // Check if user is authorized to create this prescription
    if (req.user.role === 'doctor' && req.user.id !== Doctor_ID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create prescription for another doctor'
      });
    }
    
    // Create prescription
    const prescription = await db.create('prescriptions', {
      Patient_ID,
      Doctor_ID,
      Appointment_ID,
      Medicine_Name,
      Dosage,
      Frequency,
      Instructions,
      Refill,
      Date_Issued: new Date().toISOString().split('T')[0]
    });
    
    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update prescription
 * @route   PUT /api/prescriptions/:id
 * @access  Private/Doctor
 */
exports.updatePrescription = async (req, res, next) => {
  try {
    // Check if prescription exists
    let prescription = await db.getById('prescriptions', req.params.id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check if user is authorized to update this prescription
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'doctor' && 
      req.user.id !== prescription.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prescription'
      });
    }
    
    // Update prescription
    const updatedPrescription = await db.update('prescriptions', req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedPrescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete prescription
 * @route   DELETE /api/prescriptions/:id
 * @access  Private/Admin or Doctor
 */
exports.deletePrescription = async (req, res, next) => {
  try {
    // Check if prescription exists
    const prescription = await db.getById('prescriptions', req.params.id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check if user is authorized to delete this prescription
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'doctor' || req.user.id !== prescription.Doctor_ID)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prescription'
      });
    }
    
    // Delete prescription
    await db.delete('prescriptions', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
