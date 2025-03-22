const db = require('../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Public
 */
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await db.getAll('doctors');
    
    // Remove sensitive information
    const sanitizedDoctors = doctors.map(doctor => {
      const { Password, ...doctorData } = doctor;
      return doctorData;
    });
    
    res.status(200).json({
      success: true,
      count: sanitizedDoctors.length,
      data: sanitizedDoctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor
 * @route   GET /api/doctors/:id
 * @access  Public
 */
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await db.getById('doctors', req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Remove sensitive information
    const { Password, ...doctorData } = doctor;
    
    res.status(200).json({
      success: true,
      data: doctorData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new doctor
 * @route   POST /api/doctors
 * @access  Private/Admin
 */
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      First_Name,
      Last_Name,
      Specialization,
      Experience_Years,
      Contact_Number,
      Email,
      Consultation_Fees,
      Availability_Status,
      Clinic_Hospital_Name,
      Username,
      Password
    } = req.body;
    
    // Check if username or email already exists
    const existingDoctors = await db.query('doctors', [
      ['Email', '==', Email]
    ]);
    
    if (existingDoctors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    const usernameCheck = await db.query('doctors', [
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
    
    // Create doctor
    const doctor = await db.create('doctors', {
      First_Name,
      Last_Name,
      Specialization,
      Experience_Years,
      Contact_Number,
      Email,
      Consultation_Fees,
      Availability_Status,
      Clinic_Hospital_Name,
      Username,
      Password: hashedPassword
    });
    
    // Remove password from response
    const { Password: pwd, ...doctorData } = doctor;
    
    res.status(201).json({
      success: true,
      data: doctorData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor
 * @route   PUT /api/doctors/:id
 * @access  Private/Admin or Doctor
 */
exports.updateDoctor = async (req, res, next) => {
  try {
    // Check if doctor exists
    let doctor = await db.getById('doctors', req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if user is authorized to update this doctor
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor'
      });
    }
    
    // Handle password update separately
    if (req.body.Password) {
      const salt = await bcrypt.genSalt(10);
      req.body.Password = await bcrypt.hash(req.body.Password, salt);
    }
    
    // Update doctor
    const updatedDoctor = await db.update('doctors', req.params.id, req.body);
    
    // Remove password from response
    const { Password, ...doctorData } = updatedDoctor;
    
    res.status(200).json({
      success: true,
      data: doctorData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor
 * @route   DELETE /api/doctors/:id
 * @access  Private/Admin
 */
exports.deleteDoctor = async (req, res, next) => {
  try {
    // Check if doctor exists
    const doctor = await db.getById('doctors', req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Only admin can delete doctors
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete doctors'
      });
    }
    
    // Delete doctor
    await db.delete('doctors', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
