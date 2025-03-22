const db = require('../config/firebase');

/**
 * @desc    Get all medical reports
 * @route   GET /api/medical-reports
 * @access  Private/Admin
 */
exports.getMedicalReports = async (req, res, next) => {
  try {
    const medicalReports = await db.getAll('medicalReports');
    
    res.status(200).json({
      success: true,
      count: medicalReports.length,
      data: medicalReports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single medical report
 * @route   GET /api/medical-reports/:id
 * @access  Private/Admin or Patient or Doctor
 */
exports.getMedicalReport = async (req, res, next) => {
  try {
    const medicalReport = await db.getById('medicalReports', req.params.id);
    
    if (!medicalReport) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }
    
    // Check if user is authorized to view this medical report
    if (
      req.user.role !== 'admin' && 
      req.user.id !== medicalReport.Patient_ID && 
      req.user.id !== medicalReport.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this medical report'
      });
    }
    
    res.status(200).json({
      success: true,
      data: medicalReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medical reports for a patient
 * @route   GET /api/medical-reports/patient/:patientId
 * @access  Private/Admin or Patient
 */
exports.getPatientMedicalReports = async (req, res, next) => {
  try {
    // Check if user is authorized to view these medical reports
    if (req.user.role !== 'admin' && req.user.id !== req.params.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these medical reports'
      });
    }
    
    const medicalReports = await db.query('medicalReports', [
      ['Patient_ID', '==', req.params.patientId]
    ]);
    
    res.status(200).json({
      success: true,
      count: medicalReports.length,
      data: medicalReports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medical reports for a doctor
 * @route   GET /api/medical-reports/doctor/:doctorId
 * @access  Private/Admin or Doctor
 */
exports.getDoctorMedicalReports = async (req, res, next) => {
  try {
    // Check if user is authorized to view these medical reports
    if (req.user.role !== 'admin' && req.user.id !== req.params.doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these medical reports'
      });
    }
    
    const medicalReports = await db.query('medicalReports', [
      ['Doctor_ID', '==', req.params.doctorId]
    ]);
    
    res.status(200).json({
      success: true,
      count: medicalReports.length,
      data: medicalReports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new medical report
 * @route   POST /api/medical-reports
 * @access  Private/Doctor
 */
exports.createMedicalReport = async (req, res, next) => {
  try {
    const {
      Appointment_ID,
      Patient_ID,
      Doctor_ID,
      Diagnosis,
      Symptoms,
      Test_Recommended,
      Test_Results,
      Uploaded_Report_File
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
    
    // Check if user is authorized to create this medical report
    if (req.user.role === 'doctor' && req.user.id !== Doctor_ID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create medical report for another doctor'
      });
    }
    
    // Create medical report
    const medicalReport = await db.create('medicalReports', {
      Appointment_ID,
      Patient_ID,
      Doctor_ID,
      Diagnosis,
      Symptoms,
      Test_Recommended,
      Test_Results,
      Uploaded_Report_File,
      Date: new Date().toISOString().split('T')[0]
    });
    
    res.status(201).json({
      success: true,
      data: medicalReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update medical report
 * @route   PUT /api/medical-reports/:id
 * @access  Private/Doctor
 */
exports.updateMedicalReport = async (req, res, next) => {
  try {
    // Check if medical report exists
    let medicalReport = await db.getById('medicalReports', req.params.id);
    
    if (!medicalReport) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }
    
    // Check if user is authorized to update this medical report
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'doctor' && 
      req.user.id !== medicalReport.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this medical report'
      });
    }
    
    // Update medical report
    const updatedMedicalReport = await db.update('medicalReports', req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedMedicalReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete medical report
 * @route   DELETE /api/medical-reports/:id
 * @access  Private/Admin
 */
exports.deleteMedicalReport = async (req, res, next) => {
  try {
    // Check if medical report exists
    const medicalReport = await db.getById('medicalReports', req.params.id);
    
    if (!medicalReport) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }
    
    // Only admin can delete medical reports
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete medical reports'
      });
    }
    
    // Delete medical report
    await db.delete('medicalReports', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
