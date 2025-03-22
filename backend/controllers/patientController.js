const db = require('../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all patients
 * @route   GET /api/patients
 * @access  Private/Admin
 */
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await db.getAll('patients');
    
    // Remove sensitive information
    const sanitizedPatients = patients.map(patient => {
      const { Password, ...patientData } = patient;
      return patientData;
    });
    
    res.status(200).json({
      success: true,
      count: sanitizedPatients.length,
      data: sanitizedPatients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single patient
 * @route   GET /api/patients/:id
 * @access  Private/Admin or Patient
 */
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await db.getById('patients', req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if user is authorized to view this patient
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient data'
      });
    }
    
    // Remove sensitive information
    const { Password, ...patientData } = patient;
    
    res.status(200).json({
      success: true,
      data: patientData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new patient
 * @route   POST /api/patients
 * @access  Public
 */
exports.createPatient = async (req, res, next) => {
  try {
    const {
      First_Name,
      Last_Name,
      Date_of_Birth,
      Gender,
      Blood_Type,
      Contact_Number,
      Email,
      Address,
      Emergency_Contact,
      Insurance_Details,
      Username,
      Password
    } = req.body;
    
    // Check if username or email already exists
    const existingPatients = await db.query('patients', [
      ['Email', '==', Email]
    ]);
    
    if (existingPatients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    const usernameCheck = await db.query('patients', [
      ['Username', '==', Username]
    ]);
    
    if (usernameCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already in use'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    
    // Create patient
    const patient = await db.create('patients', {
      First_Name,
      Last_Name,
      Date_of_Birth,
      Gender,
      Blood_Type,
      Contact_Number,
      Email,
      Address,
      Emergency_Contact,
      Insurance_Details,
      Username,
      Password: hashedPassword
    });
    
    // Remove password from response
    const { Password: pwd, ...patientData } = patient;
    
    res.status(201).json({
      success: true,
      data: patientData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient
 * @route   PUT /api/patients/:id
 * @access  Private/Admin or Patient
 */
exports.updatePatient = async (req, res, next) => {
  try {
    // Check if patient exists
    let patient = await db.getById('patients', req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if user is authorized to update this patient
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient'
      });
    }
    
    // Handle password update separately
    if (req.body.Password) {
      const salt = await bcrypt.genSalt(10);
      req.body.Password = await bcrypt.hash(req.body.Password, salt);
    }
    
    // Update patient
    const updatedPatient = await db.update('patients', req.params.id, req.body);
    
    // Remove password from response
    const { Password, ...patientData } = updatedPatient;
    
    res.status(200).json({
      success: true,
      data: patientData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete patient
 * @route   DELETE /api/patients/:id
 * @access  Private/Admin or Patient
 */
exports.deletePatient = async (req, res, next) => {
  try {
    // Check if patient exists
    const patient = await db.getById('patients', req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if user is authorized to delete this patient
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this patient'
      });
    }
    
    // Delete patient
    await db.delete('patients', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
